import React from 'react'
import ReactDOMServer from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import App from './App'

export function render(url) {
  const html = ReactDOMServer.renderToString(
    React.createElement(
      React.StrictMode,
      null,
      React.createElement(
        StaticRouter,
        { location: url },
        React.createElement(App, null)
      )
    )
  )
  return { html }
} 