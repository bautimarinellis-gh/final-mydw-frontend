import { AppRouter } from './routers';
import { ThemeProvider, AuthProvider } from './contexts';
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
