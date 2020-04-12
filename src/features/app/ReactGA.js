import ReactGA from 'react-ga'

ReactGA.initialize('UA-126702426-2', {
  debug: true
})
ReactGA.pageview(window.location.pathname + window.location.search)
