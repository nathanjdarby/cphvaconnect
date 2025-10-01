import Database from 'better-sqlite3';
import path from 'path';
import { User, Ticket, ScheduleEvent, Speaker, ExhibitorType, TicketType, LocationType, Poll, PollOption, UserVote, AppSettings, EventFile } from '@/types';

// Database singleton
let db: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (!db) {
    const dbPath = path.join(process.cwd(), 'database', 'cphva_connect.db');
    db = new Database(dbPath);
    
    // Enable foreign keys
    db.pragma('foreign_keys = ON');
    
    // Configure for better performance
    db.pragma('journal_mode = WAL');
    db.pragma('synchronous = NORMAL');
    db.pragma('cache_size = 10000');
  }
  return db;
}

// Helper function to convert SQLite boolean (integer) to boolean
function intToBool(value: number | null): boolean {
  return value === 1;
}

// Helper function to convert boolean to SQLite integer
function boolToInt(value: boolean): number {
  return value ? 1 : 0;
}

// User operations
export const userService = {
  async getUserById(id: string): Promise<User | null> {
    const db = getDatabase();
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
    const row = stmt.get(id) as any;
    
    if (!row) return null;
    
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      role: row.role,
      nameIsPublic: intToBool(row.name_is_public),
      emailIsPublic: intToBool(row.email_is_public),
      bio: row.bio,
      avatarUrl: row.avatar_url,
      avatarStoragePath: row.avatar_storage_path,
    };
  },

  async createUser(user: User): Promise<void> {
    const db = getDatabase();
    const stmt = db.prepare(`
      INSERT INTO users (id, name, email, role, name_is_public, email_is_public, bio, avatar_url, avatar_storage_path)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      user.id,
      user.name,
      user.email,
      user.role,
      boolToInt(user.nameIsPublic || false),
      boolToInt(user.emailIsPublic || false),
      user.bio,
      user.avatarUrl,
      user.avatarStoragePath
    );
  },

  async updateUser(id: string, updates: Partial<User>): Promise<void> {
    const db = getDatabase();
    const fields = Object.keys(updates).map(key => {
      if (key === 'nameIsPublic') return 'name_is_public';
      if (key === 'emailIsPublic') return 'email_is_public';
      if (key === 'avatarUrl') return 'avatar_url';
      if (key === 'avatarStoragePath') return 'avatar_storage_path';
      return key;
    });
    
    const placeholders = fields.map(() => '?').join(', ');
    const values = Object.values(updates).map(value => {
      if (typeof value === 'boolean') return boolToInt(value);
      return value;
    });
    
    const stmt = db.prepare(`UPDATE users SET ${fields.map(f => `${f} = ?`).join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`);
    stmt.run(...values, id);
  },

  async getAllUsers(): Promise<User[]> {
    const db = getDatabase();
    const stmt = db.prepare('SELECT * FROM users ORDER BY name ASC');
    const rows = stmt.all() as any[];
    
    return rows.map(row => ({
      id: row.id,
      name: row.name,
      email: row.email,
      role: row.role,
      nameIsPublic: intToBool(row.name_is_public),
      emailIsPublic: intToBool(row.email_is_public),
      bio: row.bio,
      avatarUrl: row.avatar_url,
      avatarStoragePath: row.avatar_storage_path,
    }));
  },

  async deleteUser(id: string): Promise<void> {
    const db = getDatabase();
    const stmt = db.prepare('DELETE FROM users WHERE id = ?');
    stmt.run(id);
  }
};

// Ticket operations
export const ticketService = {
  async getTicketsByUserId(userId: string): Promise<Ticket[]> {
    const db = getDatabase();
    const stmt = db.prepare('SELECT * FROM tickets WHERE user_id = ? ORDER BY purchase_date DESC');
    const rows = stmt.all(userId) as any[];
    
    return rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      userName: row.user_name,
      conferenceName: row.conference_name,
      ticketType: row.ticket_type,
      ticketPrice: row.ticket_price,
      purchaseDate: row.purchase_date,
      qrCodeValue: row.qr_code_value,
      isCheckedIn: intToBool(row.is_checked_in),
      checkInTimestamp: row.check_in_timestamp,
    }));
  },

  async getAllTickets(): Promise<Ticket[]> {
    const db = getDatabase();
    const stmt = db.prepare('SELECT * FROM tickets ORDER BY purchase_date DESC');
    const rows = stmt.all() as any[];
    
    return rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      userName: row.user_name,
      conferenceName: row.conference_name,
      ticketType: row.ticket_type,
      ticketPrice: row.ticket_price,
      purchaseDate: row.purchase_date,
      qrCodeValue: row.qr_code_value,
      isCheckedIn: intToBool(row.is_checked_in),
      checkInTimestamp: row.check_in_timestamp,
    }));
  },

  async createTicket(ticket: Omit<Ticket, 'id'>): Promise<string> {
    const db = getDatabase();
    const id = `ticket-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const stmt = db.prepare(`
      INSERT INTO tickets (id, user_id, user_name, conference_name, ticket_type, ticket_price, purchase_date, qr_code_value, is_checked_in, check_in_timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      id,
      ticket.userId,
      ticket.userName,
      ticket.conferenceName,
      ticket.ticketType,
      ticket.ticketPrice,
      ticket.purchaseDate,
      ticket.qrCodeValue,
      boolToInt(ticket.isCheckedIn),
      ticket.checkInTimestamp
    );
    
    return id;
  },

  async updateTicket(id: string, updates: Partial<Ticket>): Promise<void> {
    const db = getDatabase();
    const fields = Object.keys(updates).map(key => {
      if (key === 'userId') return 'user_id';
      if (key === 'userName') return 'user_name';
      if (key === 'conferenceName') return 'conference_name';
      if (key === 'ticketType') return 'ticket_type';
      if (key === 'ticketPrice') return 'ticket_price';
      if (key === 'purchaseDate') return 'purchase_date';
      if (key === 'qrCodeValue') return 'qr_code_value';
      if (key === 'isCheckedIn') return 'is_checked_in';
      if (key === 'checkInTimestamp') return 'check_in_timestamp';
      return key;
    });
    
    const values = Object.values(updates).map(value => {
      if (typeof value === 'boolean') return boolToInt(value);
      return value;
    });
    
    const stmt = db.prepare(`UPDATE tickets SET ${fields.map(f => `${f} = ?`).join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`);
    stmt.run(...values, id);
  },

  async getTicketByQrCode(qrCode: string): Promise<Ticket | null> {
    const db = getDatabase();
    const stmt = db.prepare('SELECT * FROM tickets WHERE qr_code_value = ?');
    const row = stmt.get(qrCode) as any;
    
    if (!row) return null;
    
    return {
      id: row.id,
      userId: row.user_id,
      userName: row.user_name,
      conferenceName: row.conference_name,
      ticketType: row.ticket_type,
      ticketPrice: row.ticket_price,
      purchaseDate: row.purchase_date,
      qrCodeValue: row.qr_code_value,
      isCheckedIn: intToBool(row.is_checked_in),
      checkInTimestamp: row.check_in_timestamp,
    };
  }
};

// Schedule Event operations
export const scheduleService = {
  async getAllEvents(): Promise<ScheduleEvent[]> {
    const db = getDatabase();
    const stmt = db.prepare(`
      SELECT 
        se.*,
        l.name as location_name,
        GROUP_CONCAT(s.name) as speaker_names
      FROM schedule_events se
      LEFT JOIN locations l ON se.location_id = l.id
      LEFT JOIN event_speakers es ON se.id = es.event_id
      LEFT JOIN speakers s ON es.speaker_id = s.id
      GROUP BY se.id, l.name
      ORDER BY se.start_time
    `);
    
    const rows = stmt.all() as any[];
    
    return rows.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      startTime: row.start_time,
      endTime: row.end_time,
      locationId: row.location_id,
      offerDownloads: intToBool(row.offer_downloads),
      eventFiles: [], // TODO: Implement event files
      createdAt: row.created_at,
    }));
  },

  async getEventById(id: string): Promise<ScheduleEvent | null> {
    const db = getDatabase();
    const stmt = db.prepare(`
      SELECT 
        se.*,
        l.name as location_name,
        GROUP_CONCAT(s.name) as speaker_names
      FROM schedule_events se
      LEFT JOIN locations l ON se.location_id = l.id
      LEFT JOIN event_speakers es ON se.id = es.event_id
      LEFT JOIN speakers s ON es.speaker_id = s.id
      WHERE se.id = ?
      GROUP BY se.id, l.name
    `);
    
    const row = stmt.get(id) as any;
    
    if (!row) return null;
    
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      startTime: row.start_time,
      endTime: row.end_time,
      locationId: row.location_id,
      offerDownloads: intToBool(row.offer_downloads),
      eventFiles: [], // TODO: Implement event files
      createdAt: row.created_at,
    };
  },

  async createEvent(event: Omit<ScheduleEvent, 'id'>): Promise<string> {
    const db = getDatabase();
    const id = `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const stmt = db.prepare(`
      INSERT INTO schedule_events (id, title, description, start_time, end_time, location_id, offer_downloads)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      id,
      event.title,
      event.description,
      event.startTime,
      event.endTime,
      event.locationId,
      boolToInt(event.offerDownloads || false)
    );
    
    return id;
  },

  async updateEvent(id: string, updates: Partial<ScheduleEvent>): Promise<void> {
    const db = getDatabase();
    const fields = Object.keys(updates).map(key => {
      if (key === 'startTime') return 'start_time';
      if (key === 'endTime') return 'end_time';
      if (key === 'locationId') return 'location_id';
      if (key === 'offerDownloads') return 'offer_downloads';
      if (key === 'createdAt') return 'created_at';
      return key;
    });
    
    const values = Object.values(updates).map(value => {
      if (typeof value === 'boolean') return boolToInt(value);
      return value;
    });
    
    const stmt = db.prepare(`UPDATE schedule_events SET ${fields.map(f => `${f} = ?`).join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`);
    stmt.run(...values, id);
  },

  async deleteEvent(id: string): Promise<void> {
    const db = getDatabase();
    const stmt = db.prepare('DELETE FROM schedule_events WHERE id = ?');
    stmt.run(id);
  }
};

// Speaker operations
export const speakerService = {
  async getAllSpeakers(): Promise<Speaker[]> {
    const db = getDatabase();
    const stmt = db.prepare('SELECT * FROM speakers ORDER BY name ASC');
    const rows = stmt.all() as any[];
    
    return rows.map(row => ({
      id: row.id,
      name: row.name,
      title: row.title,
      bio: row.bio,
      imageUrl: row.image_url,
      imageStoragePath: row.image_storage_path,
      dataAiHint: row.data_ai_hint,
    }));
  },

  async getSpeakerById(id: string): Promise<Speaker | null> {
    const db = getDatabase();
    const stmt = db.prepare('SELECT * FROM speakers WHERE id = ?');
    const row = stmt.get(id) as any;
    
    if (!row) return null;
    
    return {
      id: row.id,
      name: row.name,
      title: row.title,
      bio: row.bio,
      imageUrl: row.image_url,
      imageStoragePath: row.image_storage_path,
      dataAiHint: row.data_ai_hint,
    };
  },

  async createSpeaker(speaker: Omit<Speaker, 'id'>): Promise<string> {
    const db = getDatabase();
    const id = `speaker-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const stmt = db.prepare(`
      INSERT INTO speakers (id, name, title, bio, image_url, image_storage_path, data_ai_hint)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      id,
      speaker.name,
      speaker.title,
      speaker.bio,
      speaker.imageUrl,
      speaker.imageStoragePath,
      speaker.dataAiHint
    );
    
    return id;
  },

  async updateSpeaker(id: string, updates: Partial<Speaker>): Promise<void> {
    const db = getDatabase();
    const fields = Object.keys(updates).map(key => {
      if (key === 'imageUrl') return 'image_url';
      if (key === 'imageStoragePath') return 'image_storage_path';
      if (key === 'dataAiHint') return 'data_ai_hint';
      return key;
    });
    
    const stmt = db.prepare(`UPDATE speakers SET ${fields.map(f => `${f} = ?`).join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`);
    stmt.run(...Object.values(updates), id);
  },

  async deleteSpeaker(id: string): Promise<void> {
    const db = getDatabase();
    const stmt = db.prepare('DELETE FROM speakers WHERE id = ?');
    stmt.run(id);
  }
};

// Poll operations
export const pollService = {
  async getAllPolls(): Promise<Poll[]> {
    const db = getDatabase();
    const stmt = db.prepare('SELECT * FROM polls ORDER BY created_at DESC');
    const rows = stmt.all() as any[];
    
    const polls: Poll[] = [];
    
    for (const row of rows) {
      const optionsStmt = db.prepare('SELECT * FROM poll_options WHERE poll_id = ?');
      const options = optionsStmt.all(row.id) as any[];
      
      polls.push({
        id: row.id,
        question: row.question,
        isOpen: intToBool(row.is_open),
        options: options.map(opt => ({
          id: opt.id,
          text: opt.text,
          votes: opt.votes,
        })),
        createdAt: row.created_at,
      });
    }
    
    return polls;
  },

  async getPollById(id: string): Promise<Poll | null> {
    const db = getDatabase();
    const stmt = db.prepare('SELECT * FROM polls WHERE id = ?');
    const row = stmt.get(id) as any;
    
    if (!row) return null;
    
    const optionsStmt = db.prepare('SELECT * FROM poll_options WHERE poll_id = ?');
    const options = optionsStmt.all(id) as any[];
    
    return {
      id: row.id,
      question: row.question,
      isOpen: intToBool(row.is_open),
      options: options.map(opt => ({
        id: opt.id,
        text: opt.text,
        votes: opt.votes,
      })),
      createdAt: row.created_at,
    };
  },

  async createPoll(poll: Omit<Poll, 'id'>): Promise<string> {
    const db = getDatabase();
    const id = `poll-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const pollStmt = db.prepare(`
      INSERT INTO polls (id, question, is_open)
      VALUES (?, ?, ?)
    `);
    
    pollStmt.run(id, poll.question, boolToInt(poll.isOpen));
    
    // Insert options
    const optionStmt = db.prepare(`
      INSERT INTO poll_options (id, poll_id, text, votes)
      VALUES (?, ?, ?, ?)
    `);
    
    for (const option of poll.options) {
      optionStmt.run(option.id, id, option.text, option.votes);
    }
    
    return id;
  },

  async voteInPoll(userId: string, pollId: string, optionId: string): Promise<void> {
    const db = getDatabase();
    
    // Check if user already voted
    const existingVoteStmt = db.prepare('SELECT * FROM user_votes WHERE user_id = ? AND poll_id = ?');
    const existingVote = existingVoteStmt.get(userId, pollId) as any;
    
    if (existingVote) {
      throw new Error('User has already voted in this poll');
    }
    
    // Add vote
    const voteId = `vote-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const voteStmt = db.prepare(`
      INSERT INTO user_votes (id, user_id, poll_id, option_id)
      VALUES (?, ?, ?, ?)
    `);
    
    voteStmt.run(voteId, userId, pollId, optionId);
    
    // Update option vote count
    const updateStmt = db.prepare('UPDATE poll_options SET votes = votes + 1 WHERE id = ?');
    updateStmt.run(optionId);
  }
};

// App Settings operations
export const settingsService = {
  async getAppSettings(): Promise<AppSettings> {
    const db = getDatabase();
    const stmt = db.prepare('SELECT * FROM app_settings WHERE id = "settings"');
    const row = stmt.get() as any;
    
    if (!row) {
      // Return default settings
      return {
        title: "Unite-CPHVA Annual Professional Conference 2025",
        ticketSalesEnabled: true,
        colors: {
          background: "0 0% 94%",
          foreground: "0 0% 20%",
          primary: "166 29% 40%",
          accent: "283 49% 60%",
        }
      };
    }
    
    return {
      title: row.title,
      ticketSalesEnabled: intToBool(row.ticket_sales_enabled),
      colors: {
        background: row.background_color || "0 0% 94%",
        foreground: row.foreground_color || "0 0% 20%",
        primary: row.primary_color || "166 29% 40%",
        accent: row.accent_color || "283 49% 60%",
      }
    };
  },

  async updateAppSettings(settings: Partial<AppSettings>): Promise<void> {
    const db = getDatabase();
    
    const fields = Object.keys(settings).map(key => {
      if (key === 'ticketSalesEnabled') return 'ticket_sales_enabled';
      if (key === 'colors') return null; // Handle colors separately
      return key;
    }).filter(Boolean);
    
    const values = Object.values(settings).map(value => {
      if (typeof value === 'boolean') return boolToInt(value);
      if (typeof value === 'object' && value !== null) return null; // Handle colors separately
      return value;
    }).filter(value => value !== null);
    
    if (fields.length > 0) {
      const stmt = db.prepare(`UPDATE app_settings SET ${fields.map(f => `${f} = ?`).join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = "settings"`);
      stmt.run(...values);
    }
    
    // Handle colors separately
    if (settings.colors) {
      const colorStmt = db.prepare(`
        UPDATE app_settings 
        SET background_color = ?, foreground_color = ?, primary_color = ?, accent_color = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = "settings"
      `);
      colorStmt.run(
        settings.colors.background,
        settings.colors.foreground,
        settings.colors.primary,
        settings.colors.accent
      );
    }
  }
};

// Ticket Type operations
export const ticketTypeService = {
  async getAllTicketTypes(): Promise<TicketType[]> {
    const db = getDatabase();
    const stmt = db.prepare('SELECT * FROM ticket_types ORDER BY price ASC');
    const rows = stmt.all() as any[];
    
    return rows.map(row => ({
      id: row.id,
      name: row.name,
      price: row.price,
      description: row.description,
    }));
  },

  async createTicketType(ticketType: Omit<TicketType, 'id'>): Promise<string> {
    const db = getDatabase();
    const id = `tt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const stmt = db.prepare(`
      INSERT INTO ticket_types (id, name, price, description)
      VALUES (?, ?, ?, ?)
    `);
    
    stmt.run(id, ticketType.name, ticketType.price, ticketType.description);
    
    return id;
  },

  async updateTicketType(id: string, updates: Partial<TicketType>): Promise<void> {
    const db = getDatabase();
    const fields = Object.keys(updates);
    const values = Object.values(updates);
    
    const stmt = db.prepare(`UPDATE ticket_types SET ${fields.map(f => `${f} = ?`).join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`);
    stmt.run(...values, id);
  },

  async deleteTicketType(id: string): Promise<void> {
    const db = getDatabase();
    const stmt = db.prepare('DELETE FROM ticket_types WHERE id = ?');
    stmt.run(id);
  }
};

// Location operations
export const locationService = {
  async getAllLocations(): Promise<LocationType[]> {
    const db = getDatabase();
    const stmt = db.prepare('SELECT * FROM locations ORDER BY name ASC');
    const rows = stmt.all() as any[];
    
    return rows.map(row => ({
      id: row.id,
      name: row.name,
    }));
  },

  async createLocation(location: Omit<LocationType, 'id'>): Promise<string> {
    const db = getDatabase();
    const id = `loc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const stmt = db.prepare(`
      INSERT INTO locations (id, name)
      VALUES (?, ?)
    `);
    
    stmt.run(id, location.name);
    
    return id;
  },

  async updateLocation(id: string, updates: Partial<LocationType>): Promise<void> {
    const db = getDatabase();
    const fields = Object.keys(updates);
    const values = Object.values(updates);
    
    const stmt = db.prepare(`UPDATE locations SET ${fields.map(f => `${f} = ?`).join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`);
    stmt.run(...values, id);
  },

  async deleteLocation(id: string): Promise<void> {
    const db = getDatabase();
    const stmt = db.prepare('DELETE FROM locations WHERE id = ?');
    stmt.run(id);
  }
};

// Exhibitor operations
export const exhibitorService = {
  async getAllExhibitors(): Promise<ExhibitorType[]> {
    const db = getDatabase();
    const stmt = db.prepare('SELECT * FROM exhibitors ORDER BY name ASC');
    const rows = stmt.all() as any[];
    
    return rows.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description,
      logoUrl: row.logo_url,
      logoStoragePath: row.logo_storage_path,
      websiteUrl: row.website_url,
      boothNumber: row.booth_number,
      dataAiHint: row.data_ai_hint,
    }));
  },

  async getExhibitorById(id: string): Promise<ExhibitorType | null> {
    const db = getDatabase();
    const stmt = db.prepare('SELECT * FROM exhibitors WHERE id = ?');
    const row = stmt.get(id) as any;
    
    if (!row) return null;
    
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      logoUrl: row.logo_url,
      logoStoragePath: row.logo_storage_path,
      websiteUrl: row.website_url,
      boothNumber: row.booth_number,
      dataAiHint: row.data_ai_hint,
    };
  },

  async createExhibitor(exhibitor: Omit<ExhibitorType, 'id'>): Promise<string> {
    const db = getDatabase();
    const id = `ex-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const stmt = db.prepare(`
      INSERT INTO exhibitors (id, name, description, logo_url, logo_storage_path, website_url, booth_number, data_ai_hint)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      id,
      exhibitor.name,
      exhibitor.description,
      exhibitor.logoUrl,
      exhibitor.logoStoragePath,
      exhibitor.websiteUrl,
      exhibitor.boothNumber,
      exhibitor.dataAiHint
    );
    
    return id;
  },

  async updateExhibitor(id: string, updates: Partial<ExhibitorType>): Promise<void> {
    const db = getDatabase();
    const fields = Object.keys(updates).map(key => {
      if (key === 'logoUrl') return 'logo_url';
      if (key === 'logoStoragePath') return 'logo_storage_path';
      if (key === 'websiteUrl') return 'website_url';
      if (key === 'boothNumber') return 'booth_number';
      if (key === 'dataAiHint') return 'data_ai_hint';
      return key;
    });
    
    const stmt = db.prepare(`UPDATE exhibitors SET ${fields.map(f => `${f} = ?`).join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`);
    stmt.run(...Object.values(updates), id);
  },

  async deleteExhibitor(id: string): Promise<void> {
    const db = getDatabase();
    const stmt = db.prepare('DELETE FROM exhibitors WHERE id = ?');
    stmt.run(id);
  }
};
