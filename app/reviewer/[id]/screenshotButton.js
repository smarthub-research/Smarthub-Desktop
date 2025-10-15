'use client';

import { useState } from 'react';
import { domToPng } from 'modern-screenshot';
import { Camera, Printer } from 'lucide-react';
import { Button } from '../../components/ui/button';

/**
 * ScreenshotButton - Exports the entire rendered test view as an image
 * 
 * This component uses modern-screenshot to convert the entire .screenshot-container
 * element to a high-quality PNG image. Modern-screenshot handles modern CSS features
 * like oklch colors properly by using the browser's native rendering capabilities.
 * The image is saved to the user's downloads folder with a filename based on
 * the test name and current date.
 * 
 * Alternative: Also provides a print button for browser's native print dialog.
 * 
 * @param {Object} testData - Test data object containing test_name for filename generation
 */
export default function ScreenshotButton({ testData }) {
    const [isExporting, setIsExporting] = useState(false);

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

            // Scroll to top before capturing
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

    const handlePrint = () => {
        // Use browser's native print dialog
        window.print();
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
            
            <Button
                onClick={handlePrint}
                variant="outline"
                className="flex items-center gap-2"
                title="Print or save as PDF using browser"
            >
                <Printer className="w-4 h-4" />
                <span>Print</span>
            </Button>
        </div>
    );
}
