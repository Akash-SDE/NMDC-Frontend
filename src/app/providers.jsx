import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { AuthProvider } from "../context/AuthContext";
import { store } from "../store";
import ErrorBoundary from "../components/common/ErrorBoundary";

export function AppProviders({ children }) {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AuthProvider>
          <ErrorBoundary>{children}</ErrorBoundary>
        </AuthProvider>
      </BrowserRouter>
    </Provider>
  );
}

export default AppProviders;
