import {
  degToRad,
  radToDeg,
} from '../Geometry';

export const square=(turtle, side)=>{
    for(var i = 0; i<4; i++){
        turtle.forward(side);
        turtle.right(90);
    }
  }

  export const curve=(turtle, n, length, angle)=>{
    for(var i=0; i<n; i++){
        turtle.forward(length);
        turtle.left(angle);
    }
  }

  export const arc=(turtle, radius, angle)=>{

    var arc_length = 2 * Math.PI * radius * Math.abs(angle) /360;
    var n = parseInt(arc_length / 4, 10) + 1;
    var step_length = arc_length / n;
    var step_angle = parseFloat(angle) / n;

    turtle.left(step_angle/2);
    curve(turtle,n, step_length, step_angle);
    turtle.right(step_angle/2);
  }

  export const spike=(turtle, centre_radius,spike_height, curve_radius,n)=>{

    var half_side_angle = 360 / (2*n);

    var half_spike_base = Math.tan(degToRad(half_side_angle)) * centre_radius;

    var spike_base_angle = radToDeg(Math.atan(spike_height / half_spike_base));
    var side_deflection_angle = 360 / n;
    var spike_side_initial_angle = side_deflection_angle - spike_base_angle;

    var spike_side_length = Math.sqrt((half_spike_base * half_spike_base) + (spike_height * spike_height));

    var half_spike_top_angle = 90 - spike_base_angle;
    var spike_top_turn_angle = 180 - (2 * half_spike_top_angle);

    var chord_angle = radToDeg(2* (Math.asin(spike_side_length/(2*curve_radius))));

    turtle.left(spike_side_initial_angle);
    turtle.right(chord_angle/2);
    arc(turtle,curve_radius,chord_angle);
    turtle.right(chord_angle/2);

    turtle.left(spike_top_turn_angle);

    turtle.right(chord_angle/2);
    arc(turtle,curve_radius,chord_angle);
    turtle.right(chord_angle/2);

    turtle.right(spike_base_angle);

  }

  export const radial=(turtle, centre_radius,spike_height,curve_radius,n)=>{
    for(var i=0; i<n; i++){
      spike(turtle,centre_radius,spike_height,curve_radius,n);
    }
  }
 // Needs work to be useful in the Machine!
 /*export const fancy_radial(){

    var height = 130;
    var original_height = height;
    // ratio of centre radius to spike length

    var ratio = 1/1.7;

    // 39 is a hack...
    for(var i = 0; i <39; i++){
        height = height -3;

        var centre = height * (1-ratio);
        var spike_height = height * ratio;

        turtle.goto(centre,(centre/2));
        // hack co-efficient to avoid me having to calculate it
        turtle.angle(i*0.8);

        turtle.radial(centre,spike_height,60,7);
        turtle.goto(0,0)
        turtle.angle(0)

        turtle.hideTurtle();
     }
   }*/
