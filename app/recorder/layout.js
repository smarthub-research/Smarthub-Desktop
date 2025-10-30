
import {TestProvider} from "./context/testContext";

export default function RootLayout({ children }) {
    return (
        <TestProvider>
            <div>
                {children}
            </div>
        </TestProvider>
    )
}