import { Component, ReactNode } from 'react'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  handleReload = () => {
    window.location.reload()
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            alignItems: 'center',
            bgcolor: 'grey.100',
            display: 'flex',
            justifyContent: 'center',
            minHeight: '100vh',
            p: 2,
          }}
        >
          <Card
            elevation={0}
            sx={{
              border: 1,
              borderColor: 'divider',
              borderRadius: 3,
              maxWidth: 420,
              width: '100%',
            }}
          >
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
              <Box component="img" src="/logo.svg" alt="Logo" sx={{ height: 40, mb: 3 }} />
              <Typography variant="h4" component="h1" fontWeight={700}>
                Algo deu errado
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 1, mb: 4 }}>
                Ocorreu um erro inesperado. Por favor, tente novamente.
              </Typography>
              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={this.handleReload}
                sx={{ py: 1.5 }}
              >
                Recarregar Página
              </Button>
              <Button
                variant="outlined"
                fullWidth
                size="large"
                onClick={this.handleGoHome}
                sx={{ mt: 2, py: 1.5 }}
              >
                Ir para Início
              </Button>
            </CardContent>
          </Card>
        </Box>
      )
    }

    return this.props.children
  }
}
