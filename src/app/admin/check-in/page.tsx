"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../hooks/use-auth";
import type { User } from "../../../types";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "../../../components/ui/alert";
import {
  QrCode,
  ShieldAlert,
  Video,
  VideoOff,
  TicketCheck,
  AlertTriangle,
  Search,
} from "lucide-react";
import { Html5Qrcode, Html5QrcodeScannerState } from "html5-qrcode";
import { useToast } from "../../../hooks/use-toast";

const QR_SCANNER_ELEMENT_ID = "qr-reader";

export default function AdminCheckInPage() {
  const { user, loading, validateTicket } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [manualTicketId, setManualTicketId] = useState("");
  const [validationResult, setValidationResult] = useState<{
    message: string;
    type: "success" | "error" | "warning" | "info";
  } | null>(null);
  const [isScannerActive, setIsScannerActive] = useState(false);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  const authorizedRoles: User["role"][] = ["admin", "organiser"];

  useEffect(() => {
    return () => {
      // Cleanup scanner when component unmounts or scanner becomes inactive
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current
          .stop()
          .catch((err) =>
            console.error("Failed to stop QR scanner on unmount:", err)
          );
      }
    };
  }, []);

  const handleValidation = async (ticketId: string) => {
    if (!validateTicket) {
      setValidationResult({
        message: "Ticket validation service not available.",
        type: "error",
      });
      return;
    }
    if (!ticketId.trim()) {
      setValidationResult({
        message: "Please enter a Ticket ID.",
        type: "warning",
      });
      return;
    }
    const result = await validateTicket(ticketId.trim());
    if (result && result.isValid && result.isNewlyCheckedIn) {
      setValidationResult({
        message: `Ticket "${ticketId}" checked in successfully! Welcome, ${
          result.ticket?.userName || "attendee"
        }!`,
        type: "success",
      });
      toast({
        title: "Check-in Success",
        description: `Ticket for ${result.ticket?.userName} checked in.`,
      });
    } else if (result && result.isValid && !result.isNewlyCheckedIn) {
      setValidationResult({
        message: `Ticket "${ticketId}" was already checked in for ${result.ticket?.userName}.`,
        type: "info",
      });
      toast({
        title: "Already Checked In",
        description: `Ticket for ${result.ticket?.userName} was previously checked in.`,
        variant: "default",
      });
    } else {
      setValidationResult({
        message: result?.message || "Unknown error",
        type: "error",
      });
      toast({
        title: "Check-in Failed",
        description: result?.message || "Unknown error",
        variant: "destructive",
      });
    }
    setManualTicketId(""); // Clear input after validation
  };

  const onScanSuccess = (decodedText: string, result: any) => {
    if (html5QrCodeRef.current && isScannerActive) {
      stopScanner();
    }
    setManualTicketId(decodedText); // Populate input with scanned data
    handleValidation(decodedText);
  };

  const onScanError = (errorMessage: string, error: any) => {
    // console.warn(`QR Code no longer detected or error: ${errorMessage}`, error);
    // Don't show toast for common "no QR code found" errors to avoid spamming user
    if (!errorMessage.toLowerCase().includes("no qr code found")) {
      // toast({ title: "Scanning Issue", description: errorMessage, variant: "default", duration: 3000 });
    }
  };

  const startScanner = async () => {
    if (isScannerActive || !document.getElementById(QR_SCANNER_ELEMENT_ID))
      return;

    setValidationResult(null); // Clear previous results
    html5QrCodeRef.current = new Html5Qrcode(QR_SCANNER_ELEMENT_ID);

    const qrConfig = {
      fps: 10,
      qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
        const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
        const qrboxSize = Math.floor(minEdge * 0.85); // Use 85% of the smaller dimension
        return {
          width: qrboxSize,
          height: qrboxSize,
        };
      },
      // aspectRatio is removed when qrbox is a function, as the function defines the box dimensions.
    };

    try {
      await html5QrCodeRef.current.start(
        { facingMode: "environment" },
        qrConfig,
        onScanSuccess,
        onScanError
      );
      setIsScannerActive(true);
    } catch (err: any) {
      console.error("Failed to start QR scanner:", err);
      setValidationResult({
        message: `Error starting camera: ${
          err.message || err
        }. Please ensure camera permissions are granted.`,
        type: "error",
      });
      toast({
        title: "Camera Error",
        description: "Could not start camera. Check permissions.",
        variant: "destructive",
      });
      setIsScannerActive(false); // Ensure state is updated
    }
  };

  const stopScanner = () => {
    if (
      html5QrCodeRef.current &&
      html5QrCodeRef.current.getState() === Html5QrcodeScannerState.SCANNING
    ) {
      html5QrCodeRef.current
        .stop()
        .then(() => {
          setIsScannerActive(false);
          // html5QrCodeRef.current = null; // Keep ref until explicitly starting again
        })
        .catch((err) => {
          console.error("Error stopping QR scanner:", err);
          // Even if stop fails, update UI state
          setIsScannerActive(false);
          // html5QrCodeRef.current = null;
        });
    } else {
      setIsScannerActive(false); // if it wasn't scanning, just update state
      // html5QrCodeRef.current = null;
    }
  };

  if (loading) {
    return (
      <div className="text-center py-10">
        <p>Loading admin check-in...</p>
      </div>
    );
  }

  if (!user || !authorizedRoles.includes(user.role)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center">
        <ShieldAlert className="h-16 w-16 text-destructive mb-4" />
        <h1 className="text-2xl font-bold text-destructive">Access Denied</h1>
        <p className="text-muted-foreground">
          You do not have permission to view this page.
        </p>
        <Button onClick={() => router.push("/")} className="mt-4">
          Go to Homepage
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-primary flex items-center">
            <QrCode className="mr-3 h-8 w-8 text-accent" />
            Attendee Check-in
          </CardTitle>
          <CardDescription>
            Scan QR codes or manually enter Ticket IDs to check in attendees.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* QR Code Scanner Section */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground/90">
              QR Code Scan
            </h3>
            {!isScannerActive ? (
              <Button onClick={startScanner} className="w-full">
                <Video className="mr-2 h-5 w-5" /> Start Camera Scan
              </Button>
            ) : (
              <Button
                onClick={stopScanner}
                variant="outline"
                className="w-full"
              >
                <VideoOff className="mr-2 h-5 w-5" /> Stop Camera Scan
              </Button>
            )}
            {/* Adjusted styling for the scanner view container */}
            <div
              id={QR_SCANNER_ELEMENT_ID}
              className={`w-full max-w-md mx-auto rounded-md overflow-hidden ${
                !isScannerActive ? "h-0" : "aspect-square border bg-muted"
              }`}
            >
              {/* QR Scanner video feed will be rendered here by html5-qrcode */}
            </div>
          </div>

          {/* Manual Entry Section */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground/90">
              Manual Ticket ID Entry
            </h3>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Enter Ticket ID (e.g., USER1-TICKET1-...)"
                value={manualTicketId}
                onChange={(e) => {
                  setManualTicketId(e.target.value);
                  if (validationResult) setValidationResult(null); // Clear previous result on new input
                }}
                className="flex-grow"
              />
              <Button
                onClick={() => handleValidation(manualTicketId)}
                variant="secondary"
              >
                <Search className="mr-2 h-5 w-5" /> Validate
              </Button>
            </div>
          </div>
        </CardContent>
        {validationResult && (
          <CardFooter>
            <Alert
              variant={
                validationResult.type === "success"
                  ? "default"
                  : validationResult.type === "error"
                  ? "destructive"
                  : "default" // 'warning' and 'info' can use default styling or be customized
              }
              className="w-full"
            >
              {validationResult.type === "success" && (
                <TicketCheck className="h-5 w-5" />
              )}
              {validationResult.type === "error" && (
                <AlertTriangle className="h-5 w-5" />
              )}
              {validationResult.type === "info" && (
                <AlertTriangle className="h-5 w-5" />
              )}{" "}
              {/* Could use Info icon */}
              {validationResult.type === "warning" && (
                <AlertTriangle className="h-5 w-5" />
              )}
              <AlertTitle>
                {validationResult.type === "success"
                  ? "Success!"
                  : validationResult.type === "error"
                  ? "Error!"
                  : validationResult.type === "info"
                  ? "Information"
                  : "Notice"}
              </AlertTitle>
              <AlertDescription>{validationResult.message}</AlertDescription>
            </Alert>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
