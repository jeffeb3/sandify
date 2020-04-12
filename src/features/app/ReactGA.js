import ReactGA from 'react-ga'

ReactGA.initialize('UA-126702426-1', {
  debug: false // Set to true to see debug info in the console
})
ReactGA.pageview(window.location.pathname + window.location.search)
