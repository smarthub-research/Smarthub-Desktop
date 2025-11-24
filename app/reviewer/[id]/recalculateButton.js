import { Button } from '../../components/ui/button';
import { useRouter } from 'next/navigation';

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
            
            // Check if a new test was created
            if (data.new_test_id) {
                // Redirect to the new test
                router.push(`/reviewer/${data.new_test_id}`);
            } else {
                // If for some reason we didn't get a new test ID, just update the current view
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