
import {TestProvider} from "./context/testContext";

// Root layout for the recorder section, providing the TestProvider context
// to all child components for managing test data and state.
export default function RootLayout({ children }) {
    return (
        <TestProvider>
            <div>
                {children}
            </div>
        </TestProvider>
    )
}