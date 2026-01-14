import { Button } from '../../components/ui/button';
import { useRouter } from 'next/navigation';

/**
 * RecalculateButton
 * Triggers a backend recalculation for the given `testId`. While the
 * recalculation is running the UI is put into a loading state via
 * `setLoading`. If the backend returns a `new_test_id` the user is
 * redirected to the newly created test; otherwise the returned payload
 * updates the current view.
 */
export default function RecalculateButton({testId, setTestData, setLoading}) {
    const router = useRouter();
    
    const handleRecalculate = async () => {
        try {
            setLoading(true)
            const response = await fetch(`http://localhost:8000/db/recalculate/${testId}`, {
                method: "POST",
            });
            
            if (!response.ok) {
                throw new Error(`Failed to recalculate: ${response.statusText}`);
            }
            
            const data = await response.json()
            console.log("Recalculated test data:", data)
            
            // If backend created a new test resource, redirect there
            if (data.new_test_id) {
                router.push(`/reviewer/${data.new_test_id}`);
            } else {
                // Otherwise update the current test view with returned content
                setTestData(data)
            }
        } catch (error) {
            console.error("Error recalculating test: ", error)
            alert(`Failed to recalculate test: ${error.message}`)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button
            onClick={handleRecalculate}
            variant="outline"
            className="flex items-center gap-2"
            title="Recalculate test values with current calibration settings"
        >
            <span>Recalculate</span>
        </Button>
    )
}