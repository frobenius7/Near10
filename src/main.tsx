import { Buffer } from 'buffer/index'
import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import './index.css'
import { initContract } from './near-utils'

// @ts-expect-error
window.Buffer = Buffer

const main = async () => {
  await initContract(['get_candidates'], ['vote', 'add_candidate'])

  ReactDOM.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
    document.getElementById('root')
  )
}

main()
