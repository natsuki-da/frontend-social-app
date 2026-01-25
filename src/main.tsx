console.log("MODE:", import.meta.env.MODE);
console.log("API:", import.meta.env.VITE_API_BASE_URL);


import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import App from './App.tsx'
import {AuthProvider} from './context/AuthProvider.tsx'
import {ThemeProvider} from 'styled-components'
import {theme} from './styles/theme'
import {GlobalStyle} from './styles/GlobalStyle'


createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <ThemeProvider theme={theme}>
            <GlobalStyle/>
            <AuthProvider>
                <App/>
            </AuthProvider>
        </ThemeProvider>
    </StrictMode>
)
