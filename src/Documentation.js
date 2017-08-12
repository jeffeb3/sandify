import React, { Component } from 'react';
import './Documentation.css';

class Documentation extends Component {
  render () {
    return (
      <div className="documentation">
        <h3>About</h3>
        Sandify is working on a solution to turn your
            cold, empty hearted, emotionless sand tables into
            cold, empty hearted emotionless sand table robots with enchanting patterns.
        <br/>
        <h3>Sand Machine</h3>
        Anything that uses gcode can be used with sandify.
            But the machine this was designed for is the ZenXY from Vicious1.com:
        <br/>
        <a href="http://www.vicious1.com/zenxy/">ZenXY on Vicious1.com</a>
        <br/>
        <a href="https://www.thingiverse.com/thing:2477901">ZenXY Thingiverse Page</a>
        <br/>
        Sandify was created by users in the
        <a href="https://www.vicious1.com/forum/topic/does-this-count-as-a-build/"> Vicious1.com Forum</a>
        <br/>
        <h3>Github</h3>
        Sandify is hosted on github.io
        <br/>
        <a href="https://github.com/jeffeb3/sandify">Sandify Source Code</a>
        <br/>
        Please post any problems, feature requests or comments in the github issues:
        <br/>
        <a href="https://github.com/jeffeb3/sandify/issues">Sandify Issue Tracker</a>
        <br/>
        Sandify is a community project. We want and need developers:
        <br/>
        <a href="https://github.com/jeffeb3/sandify/wiki#developer-info">Help Sandify</a>
        <br/>
        <h3>License</h3>
        Sandify is licensed under the MIT license.
        <br/>
        Patterns that you create and gcode generated with sandify are not covered
            under the sandify license (they are your work, and are your copyright).
        <br/>
        <a href="https://raw.githubusercontent.com/jeffeb3/sandify/master/LICENSE">Sandify License</a>

      </div>
    );
  }
}

export default Documentation
