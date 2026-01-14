'use client';

import { useState } from 'react';
import { domToPng } from 'modern-screenshot';
import { Camera } from 'lucide-react';
import { Button } from '../../components/ui/button';

export default function ScreenshotButton({ testData }) {
    const [isExporting, setIsExporting] = useState(false);

    // Convert the `.screenshot-container` element to a PNG using modern-screenshot.
    // This preserves modern CSS and aims for a high-quality download.
    const exportToImage = async () => {
        setIsExporting(true);
        
        try {
            // Get the main content container
            const element = document.querySelector('.screenshot-container');
            
            if (!element) {
                console.error('Export container not found');
                alert('Could not find content to export');
                setIsExporting(false);
                return;
            }

            // Scroll to top before capturing to ensure the full layout is rendered
            const scrollY = window.scrollY;
            window.scrollTo(0, 0);
            
            // Wait for scroll to complete
            await new Promise(resolve => setTimeout(resolve, 100));

            // Generate filename with test name and timestamp
            const testName = testData?.test_name || 'test';
            const timestamp = new Date().toISOString().split('T')[0];
            const filename = `${testName}_${timestamp}.png`;

            // Capture the element as PNG with high quality
            const dataUrl = await domToPng(element, {
                quality: 1,
                scale: 2, // 2x resolution for retina displays
                backgroundColor: '#ffffff',
                style: {
                    // Ensure the container is fully visible
                    height: 'auto',
                    overflow: 'visible'
                }
            });

            // Restore scroll position
            window.scrollTo(0, scrollY);

            // Create download link
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            setIsExporting(false);

        } catch (error) {
            console.error('Error exporting image:', error);
            alert('Failed to export image: ' + error.message);
            setIsExporting(false);
            
            // Restore scroll position on error
            window.scrollTo(0, 0);
        }
    };

    return (
        <div className="flex items-center gap-2">
            <Button
                onClick={exportToImage}
                disabled={isExporting}
                className="flex items-center gap-2"
                variant="default"
            >
                {isExporting ? (
                    <>
                        <div className="w-4 h-4 border-2 border-t-transparent border-current rounded-full animate-spin" />
                        <span>Capturing...</span>
                    </>
                ) : (
                    <>
                        <Camera className="w-4 h-4" />
                        <span>Save Screenshot</span>
                    </>
                )}
            </Button>
        </div>
    );
}
