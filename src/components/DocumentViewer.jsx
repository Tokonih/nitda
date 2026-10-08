import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { FileText, Download, ExternalLink, X, Loader2 } from "lucide-react";
import { cn, forceDownload, isPreviewableFile, getPreviewUrl } from "@/lib/utils";

const DocumentViewer = ({ isOpen, onClose, fileUrl, filename }) => {
    const [isLoading, setIsLoading] = useState(true);

    // Escape key listener to close modal
    useEffect(() => {
        const handleEsc = (event) => {
            if (event.keyCode === 27) onClose();
        };
        if (isOpen) {
            window.addEventListener('keydown', handleEsc);
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
            setIsLoading(true); // Reset loading state when modal opens
        }
        return () => {
            window.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    // Also reset loading state if the file URL changes while modal is open
    useEffect(() => {
        if (isOpen && fileUrl) {
            setIsLoading(true);
        }
    }, [fileUrl, isOpen]);

    if (!isOpen) return null;


    const handleDownload = () => {
        if (!fileUrl) return;
        forceDownload(fileUrl, filename);
    };

    const isPreviewable = isPreviewableFile(filename);
    const fileExtension = filename?.split('.').pop()?.toLowerCase() || 'file';
    const isOfficeDoc = ["docx", "doc", "xlsx", "xls"].includes(fileExtension);
    const isLocalhost =
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        fileUrl?.includes('localhost') ||
        fileUrl?.includes('127.0.0.1');
    const showLocalhostWarning = isOfficeDoc && isLocalhost;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-0 sm:p-4 md:p-8">
            {/* High-quality Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/90 backdrop-blur-md transition-opacity duration-300"
                onClick={onClose}
            />

            {/* Modal Container: Fullscreen on mobile, Elegant on desktop */}
            <div
                className={cn(
                    "relative w-full h-full sm:h-auto sm:max-h-[95vh] bg-white sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 sm:zoom-in-95 duration-300",
                    isPreviewable ? "max-w-6xl sm:h-[90vh]" : "max-w-xl sm:h-auto"
                )}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header: Compact & Premium */}
                <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-20">
                    <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0 border border-green-100/50 group">
                            <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-green-700 transition-transform group-hover:scale-110" />
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-sm sm:text-base md:text-lg font-bold text-gray-900 truncate pr-2">
                                {filename || "Document Viewer"}
                            </h2>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[9px] font-black bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded uppercase tracking-tighter">
                                    {fileExtension}
                                </span>
                                <span className="text-[10px] sm:text-xs text-green-700 font-bold uppercase tracking-widest opacity-80">
                                    {isPreviewable ? "Live Preview" : "Download to View"}
                                </span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center hover:bg-gray-100/80 active:scale-90 rounded-2xl transition-all text-gray-400 hover:text-gray-900 bg-gray-50 sm:bg-transparent"
                    >
                        <X className="h-5 w-5 sm:h-6 sm:w-6" />
                    </button>
                </div>

                {/* Content Area: Optimized for viewing */}
                <div className="flex-1 overflow-hidden bg-slate-50/50 flex flex-col relative group">
                    {isPreviewable ? (
                        <div className="w-full h-full p-0 sm:p-4 lg:p-6">
                            <div className="w-full h-full bg-white sm:rounded-2xl shadow-inner border border-gray-100 overflow-hidden relative">
                                {isLoading && !showLocalhostWarning && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm z-30 transition-all duration-500">
                                        <div className="relative">
                                            <Loader2 className="h-12 w-12 text-green-600 animate-spin" />
                                            <div className="absolute inset-0 h-12 w-12 border-4 border-green-100 rounded-full"></div>
                                        </div>
                                        <p className="mt-4 text-sm font-bold text-gray-900 animate-pulse">
                                            Fetching document...
                                        </p>
                                        <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">
                                            Almost there
                                        </p>
                                    </div>
                                )}

                                {showLocalhostWarning ? (
                                    <div className="flex flex-col items-center justify-center h-full p-6 text-center bg-slate-50">
                                        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                                            <ExternalLink className="h-8 w-8 text-amber-600" />
                                        </div>
                                        <h4 className="text-lg font-bold text-gray-900 mb-2">Local Preview Limited</h4>
                                        <p className="text-sm text-gray-600 max-w-sm leading-relaxed mb-6">
                                            Google Docs Viewer cannot access files on <code className="bg-amber-50 px-1 rounded text-amber-700">localhost</code>.
                                            This preview will work once the application is deployed to a public server.
                                        </p>
                                        <Button onClick={handleDownload} className="bg-green-700 hover:bg-green-800">
                                            <Download className="h-4 w-4 mr-2" />
                                            Download to View
                                        </Button>
                                    </div>
                                ) : (
                                    <iframe
                                        src={getPreviewUrl(fileUrl)}
                                        className={cn(
                                            "w-full h-full border-none transition-opacity duration-1000",
                                            isLoading ? "opacity-0" : "opacity-100"
                                        )}
                                        onLoad={() => setIsLoading(false)}
                                        title={filename || "Document Preview"}
                                    />
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center gap-8 py-20 px-8">
                            <div className="relative">
                                <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white rounded-[2rem] shadow-xl flex items-center justify-center border border-gray-50 animate-bounce-slow">
                                    <FileText className="h-12 w-12 sm:h-16 sm:w-16 text-green-200" />
                                </div>
                                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-700 rounded-full flex items-center justify-center text-white font-black text-[10px] shadow-lg border-2 border-white">
                                    {fileExtension}
                                </div>
                            </div>

                            <div className="text-center max-w-sm">
                                <h3 className="font-black text-gray-900 text-xl sm:text-2xl mb-3 tracking-tight">
                                    Preview not Supported
                                </h3>
                                <p className="text-sm sm:text-base text-gray-500 leading-relaxed font-medium">
                                    This {fileExtension} document cannot be previewed directly. Please download it to view the content on your device.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer: Multi-device Optimized Action Bar */}
                <div className="p-4 sm:p-6 bg-white border-t border-gray-100 flex flex-col sm:flex-row gap-3 sm:gap-4 items-center">
                    <Button
                        onClick={handleDownload}
                        className="w-full sm:flex-1 bg-green-700 hover:bg-green-800 active:bg-green-900 h-13 sm:h-14 rounded-2xl text-sm font-black shadow-xl shadow-green-900/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <Download className="h-5 w-5 mr-2.5" />
                        Download Now
                    </Button>

                    <div className="flex gap-3 w-full sm:w-auto">
                        <Button
                            variant="ghost"
                            onClick={onClose}
                            className="flex-1 sm:flex h-13 sm:h-14 px-8 rounded-2xl font-bold text-gray-500 hover:text-gray-900 hover:bg-gray-50 border border-transparent sm:border-gray-100"
                        >
                            Dismiss
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DocumentViewer;
