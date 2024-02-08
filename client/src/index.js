import React from 'react'
import { Modal } from 'antd'
import ReactDOM from 'react-dom'
import { QueryClient, QueryClientProvider } from 'react-query'
import { Provider } from 'react-redux'
import { ExclamationCircleOutlined } from '@ant-design/icons'
import { AppContextProvider } from 'AppContext'
import * as serviceWorker from 'serviceWorker'
import App from 'App'
import { store } from './store'


// Sentry.init({ dsn: process.env.REACT_APP_SENTRY_DSN, environment: process.env.REACT_APP_NODE_ENV })

const queryClient = new QueryClient()

const configuration = {
  onUpdate: (registration) => {
    if (registration && registration.waiting) {
      const handleReload = () => {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' })
        window.location.reload()
      }

      Modal.confirm({
        icon: <ExclamationCircleOutlined />,
        content: (
          <>New version available! Click Reload to get the latest version.</>
        ),
        okText: 'Reload',
        cancelButtonProps: { style: { display: 'none' } },
        okButtonProps: { className: 'ant-confirm-modal-ok-button' },
        className: 'ant-confirm-modal-styled',
        onOk: handleReload,
      })
    }
  },
}

ReactDOM.render(
  <QueryClientProvider client={queryClient}>
    <AppContextProvider>
     <Provider store={store}>
      <App />
     </Provider>
    </AppContextProvider>
  </QueryClientProvider>,
  document.getElementById('root')
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.register(configuration)
