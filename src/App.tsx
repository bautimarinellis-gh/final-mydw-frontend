import { AppRouter } from './routers';
import { ThemeProvider } from './features/theme';
import { AuthProvider } from './features/auth';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
