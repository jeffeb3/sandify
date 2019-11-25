import enforceLimits from './LimitEnforcer';
import {
  pointLocation,
  intersection,
} from './LimitEnforcer';
import Victor from 'victor';

// type def to make this shorter.
let vfo = Victor.fromObject;

it('pointLocation - inside', () => {
  // inside
  expect(pointLocation(   ({x: 0.0, y: 0.0}), 1.0, 1.0)).toEqual(0b0000);
  expect(pointLocation(vfo({x: 0.0, y: 0.0}), 1.0, 1.0)).toEqual(0b0000);
});
it('pointLocation - X', () => {
  // X
  expect(pointLocation(   ({x: 1.1, y: 0.0}), 1.0, 1.0)).toEqual(0b0100);
  expect(pointLocation(vfo({x: 1.1, y: 0.0}), 1.0, 1.0)).toEqual(0b0100);
  expect(pointLocation(   ({x:-1.1, y: 0.0}), 1.0, 1.0)).toEqual(0b1000);
  expect(pointLocation(vfo({x:-1.1, y: 0.0}), 1.0, 1.0)).toEqual(0b1000);
});
it('pointLocation - Y', () => {
  // Y
  expect(pointLocation(   ({x: 0.0, y:-1.1}), 1.0, 1.0)).toEqual(0b0001);
  expect(pointLocation(vfo({x: 0.0, y:-1.1}), 1.0, 1.0)).toEqual(0b0001);
  expect(pointLocation(   ({x: 0.0, y: 1.1}), 1.0, 1.0)).toEqual(0b0010);
  expect(pointLocation(vfo({x: 0.0, y: 1.1}), 1.0, 1.0)).toEqual(0b0010);
});
it('pointLocation - XY', () => {
  // X,Y
  expect(pointLocation(   ({x: 1.1, y: 1.1}), 1.0, 1.0)).toEqual(0b0110);
  expect(pointLocation(   ({x:-1.1, y: 1.1}), 1.0, 1.0)).toEqual(0b1010);
  expect(pointLocation(   ({x:-1.1, y:-1.1}), 1.0, 1.0)).toEqual(0b1001);
  expect(pointLocation(   ({x: 1.1, y:-1.1}), 1.0, 1.0)).toEqual(0b0101);
  expect(pointLocation(vfo({x: 1.1, y: 1.1}), 1.0, 1.0)).toEqual(0b0110);
  expect(pointLocation(vfo({x:-1.1, y: 1.1}), 1.0, 1.0)).toEqual(0b1010);
  expect(pointLocation(vfo({x:-1.1, y:-1.1}), 1.0, 1.0)).toEqual(0b1001);
  expect(pointLocation(vfo({x: 1.1, y:-1.1}), 1.0, 1.0)).toEqual(0b0101);
});
it('pointLocation - Borders', () => {
  // Borders
  expect(pointLocation(   ({x: 1.0, y: 0.0}), 1.0, 1.0)).toEqual(0b0000);
  expect(pointLocation(   ({x:-1.0, y: 0.0}), 1.0, 1.0)).toEqual(0b0000);
  expect(pointLocation(   ({x: 0.0, y: 1.0}), 1.0, 1.0)).toEqual(0b0000);
  expect(pointLocation(   ({x: 0.0, y:-1.0}), 1.0, 1.0)).toEqual(0b0000);
  expect(pointLocation(   ({x: 1.0, y: 1.0}), 1.0, 1.0)).toEqual(0b0000);
  expect(pointLocation(   ({x:-1.0, y: 1.0}), 1.0, 1.0)).toEqual(0b0000);
  expect(pointLocation(   ({x:-1.0, y:-1.0}), 1.0, 1.0)).toEqual(0b0000);
  expect(pointLocation(   ({x: 1.0, y:-1.0}), 1.0, 1.0)).toEqual(0b0000);
  expect(pointLocation(vfo({x: 1.0, y: 0.0}), 1.0, 1.0)).toEqual(0b0000);
  expect(pointLocation(vfo({x:-1.0, y: 0.0}), 1.0, 1.0)).toEqual(0b0000);
  expect(pointLocation(vfo({x: 0.0, y: 1.0}), 1.0, 1.0)).toEqual(0b0000);
  expect(pointLocation(vfo({x: 0.0, y:-1.0}), 1.0, 1.0)).toEqual(0b0000);
  expect(pointLocation(vfo({x: 1.0, y: 1.0}), 1.0, 1.0)).toEqual(0b0000);
  expect(pointLocation(vfo({x:-1.0, y: 1.0}), 1.0, 1.0)).toEqual(0b0000);
  expect(pointLocation(vfo({x:-1.0, y:-1.0}), 1.0, 1.0)).toEqual(0b0000);
  expect(pointLocation(vfo({x: 1.0, y:-1.0}), 1.0, 1.0)).toEqual(0b0000);
});


it('intersection', () => {
  let start = vfo({x: 1.0, y: 1.0});
  let middl = vfo({x: 1.0, y: 0.0});
  let end   = vfo({x: 1.0, y:-1.0});
  let left  = vfo({x: 0.0, y: 0.0});
  let right = vfo({x: 2.0, y: 0.0});
  let lleft = vfo({x:-2.0, y: 0.0});
  let uleft = vfo({x: 0.0, y: 1.0});

  function doTest() {
    // parallel
    expect( intersection( vfo({x: 1.1, y:-1.0}), vfo({x: 1.1, y: 1.0}), start, end  )).toEqual( null );
    expect( intersection( vfo({x: 1.1, y:-1.0}), vfo({x: 1.1, y: 1.0}), end  , start)).toEqual( null );
    // intersection
    expect( intersection( left , right, start, end  )).toEqual( middl );
    expect( intersection( left , right, end  , start)).toEqual( middl );
    // too far
    expect( intersection( left , lleft, start, end  )).toEqual( null );
    expect( intersection( left , lleft, end  , start)).toEqual( null );
    // Just touching
    expect( intersection( left , start, start, end  )).toEqual( null );
    expect( intersection( left , middl, start, end  )).toEqual( null );
    expect( intersection( left , end  , start, end  )).toEqual( null );
    expect( intersection( start, left , start, end  )).toEqual( null );
    expect( intersection( middl, left , start, end  )).toEqual( null );
    expect( intersection( end  , left , start, end  )).toEqual( null );

    expect( intersection( left , start, end  , start)).toEqual( null );
    expect( intersection( left , middl, end  , start)).toEqual( null );
    expect( intersection( left , end  , end  , start)).toEqual( null );
    expect( intersection( start, left , end  , start)).toEqual( null );
    expect( intersection( middl, left , end  , start)).toEqual( null );
    expect( intersection( end  , left , end  , start)).toEqual( null );

    // points
    expect( intersection( left , left , start, end  )).toEqual( null );
    expect( intersection( start, start, start, end  )).toEqual( null );
  }
  doTest();

  // transpose
  start = vfo({y: 1.0, x: 1.0});
  middl = vfo({y: 1.0, x: 0.0});
  end   = vfo({y: 1.0, x:-1.0});
  left  = vfo({y: 0.0, x: 0.0});
  right = vfo({y: 2.0, x: 0.0});
  lleft = vfo({y:-2.0, x: 0.0});
  uleft = vfo({y: 0.0, x: 1.0});
  doTest();

  // bigger
  start = vfo({x: 10.0, y: 10.0});
  middl = vfo({x: 10.0, y:  0.0});
  end   = vfo({x: 10.0, y:-10.0});
  left  = vfo({x:  0.0, y:  0.0});
  right = vfo({x: 20.0, y:  0.0});
  lleft = vfo({x:-20.0, y:  0.0});
  uleft = vfo({x:  0.0, y: 10.0});
  doTest();

});




