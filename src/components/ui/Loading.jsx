import React from 'react';

const Loading = () => {
    return (
        <div className="flex items-center justify-center min-h-[400px] w-full bg-background/50 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4">
                <div className="relative">
                    <div className="h-12 w-12 rounded-full border-4 border-primary/20"></div>
                    <div className="absolute top-0 left-0 h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                </div>
                <p className="text-sm font-medium text-muted-foreground animate-pulse">
                    Loading...
                </p>
            </div>
        </div>
    );
};

export default Loading;
