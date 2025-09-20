import './App.css'
import { AppProvider } from './state/AppState'
import { AppShell } from './components/AppShell'
import { ConfirmProvider } from './ui/Confirm'

function App() {
  return (
    <AppProvider>
      <ConfirmProvider>
        <AppShell />
      </ConfirmProvider>
    </AppProvider>
  )
}

export default App
