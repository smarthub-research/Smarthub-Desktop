
import {FlaggingProvider} from "./context/flaggingContext";
import {TestProvider} from "./context/testContext";

export default function RootLayout({ children }) {
    return (
        <TestProvider>
            <FlaggingProvider>
                <div>
                    {children}
                </div>
            </FlaggingProvider>
        </TestProvider>
    )
}