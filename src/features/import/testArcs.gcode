 ; Test code for sandify input

 ; This is still a comment
 ( This is a comment too )

G1 F1000
G1 X-10 Y-10 ; This comment won't be read.
; Neither will this comment
G1 X-10 Y10
G1 X10 Y10
G1 X10 Y-10
G1 X-10 Y-10
G2 X-10 Y10 I10 J10
G2 X10 Y10 I10 J-10
G2 X10 Y-10 I-10 J-10
G2 X-10 Y-10 I-10 J10
G2 X10 Y10 I20 J0
G2 X-10 Y-10 I-20 J0
G1 X10 Y-10
G3 X-10 Y10 I-20 J0
G3 X10 Y-10 I20 J0
G2 X-10 Y-10 I-10 J10
