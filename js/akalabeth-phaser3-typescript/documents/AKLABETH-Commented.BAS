10  ONERR GOTO 200
20  REM
30  PR# 0
40   IN# 0
50  HIMEM: 49151
60  REM ------------------ NEW GAME GOSUB ------------------
70  CLEAR
80  GOSUB 3750
90  REM ------------------ MAIN PROGRAM ------------------
100  ZZ = RND(-ABS(LN))
110  LE = 0
120  TEXT
130   HOME
140   NORMAL
150   VTAB (12)
160   PRINT " WELCOME TO AKALABETH, WORLD OF DOOM!"
170  DIM DN%(10,10),TE%(20,20),XX%(10),YY%(10),PE%(10,3),LD%(10,5),CD%(10,3),FT%(10,5),LA(10,3)
180  rem
190  REM ------------------ DRAW OVERLAND ------------------
200  FOR X = 0 TO 20
210     TE%(X,0) = 1
220     TE%(0,X) = 1
230     TE%(X,20) = 1
240   TE%(20,X) = 1
250  NEXT
260  rem
270   VTAB (23)
280   PRINT " (PLEASE WAIT)";
290  REM
300  FOR X = 1 TO 19
310   FOR Y = 1 TO 19
320    TE%(X,Y) = INT ( RND (1) ^ 5 * 4.5 )
330      IF TE%(X,Y) = 3 AND RND (1) > .5 THEN TE%(X,Y) = 0
340  NEXT
350   PRINT ".";
360   NEXT
370  TE%( INT ( RND (1) * 19 + 1), INT ( RND (1) * 19 + 1)) = 5
380  TX = INT ( RND (1) * 19 + 1)
390  TY = INT ( RND (1) * 19 + 1)
400  TE%(TX,TY) = 3
410  REM ------------------ DRAW ?? ------------------
420  XX%(0) = 139
430  YY%(0) = 79
440  FOR X = 2 TO 20 STEP 2
450  XX%(X / 2) = INT ( ATN (1 / X) / ATN (1) * 140 + .5)
460  YY%(X / 2) = INT (XX%(X / 2) * 4 / 7)
470  PE%(X / 2,0) = 139 - XX%(X / 2)
480  PE%(X / 2,1) = 139 + XX%(X / 2)
490  PE%(X / 2,2) = 79 - YY%(X / 2)
500  PE%(X / 2,3) = 79 + YY%(X / 2)
510   NEXT
520  PE%(0,0) = 0
530  PE%(0,1) = 279
540  PE%(0,2) = 0
550  PE%(0,3) = 159
560  FOR X = 1 TO 10
570  CD%(X,0) = 139 - XX%(X) / 3
580  CD%(X,1) = 139 + XX%(X) / 3
590  CD%(X,2) = 79 - YY%(X) * .7
600  CD%(X,3) = 79 + YY%(X)
610   NEXT
620   PRINT " .";
630  REM --
640  FOR X = 0 TO 9
650   LD%(X,0) = (PE%(X,0) * 2 + PE%(X + 1,0)) / 3
660   LD%(X, 1) = (PE%(X,0) + 2 * PE%(X + 1,0)) / 3
670   W = LD%(X,0) - PE%(X,0)
680   LD%(X,2) = PE%(X,2) + W * 4 / 7
690   LD%(X,3) = PE%(X,2) + 2 * W * 4 / 7
700   LD%(X,4) = (PE%(X,3) * 2 + PE%(X + 1,3)) / 3
710   LD%(X,5) = (PE%(X,3) + 2 * PE%(X + 1,3)) / 3
720   LD%(X,2) = LD%(X,4) - (LD%(X,4) - LD%(X,2)) * .8
730   LD%(X,3) = LD%(X,5) - (LD%(X,5) - LD%(X,3)) * .8
740   IF LD%(X,3) = LD%(X,4) THEN LD%(X,3) = LD%(X,3) - 1
750  NEXT
760  REM ---------------------------------------------
770  FOR X = 0 TO 9
780  FT%(X,0) = 139 - XX%(X) / 3
790  FT%(X,1) = 139 + XX%(X) / 3
800  FT%(X,2) = 139 - XX%(X + 1) / 3
810  FT%(X,3) = 139 + XX%(X + 1) / 3
820  FT%(X,4) = 79 + (YY%(X) * 2 + YY%(X + 1)) / 3
830  FT%(X,5) = 79 + (YY%(X) + 2 * YY%(X + 1)) / 3
840   NEXT
850  FOR X = 0 TO 9
860  LA(X,0) = (FT%(X,0) * 2 + FT%(X,1)) / 3
870  LA(X,1) = (FT%(X,0) + 2 * FT%(X,1)) / 3
880  LA(X,3) = FT%(X,4)
890  LA(X,2) = 159 - LA(X,3)
900   NEXT
910  REM ------------------ CLEAR SCREEN ------------------
920  HOME
930   HCOLOR= 3
940  POKE 34,20
950   POKE 33,29
960   HOME
970  GOSUB 4630
980  GOTO 1930
990  FOR X = 0 TO 9
1000   FOR Y = 0 TO 5
1010   PRINT LD%(X,Y);" ";
1020   NEXT
1030   PRINT
1040   NEXT
1050   GET Q$
1060  REM ------------------ HANDLE DUNGEON ------------------
1070  HGR
1080   FOR Y = - 1 TO 1
1090   FOR X = - 1 TO 1
1100  HPLOT 138,75 TO 142,75
1110   HPLOT 140,73 TO 140,77
1120  ZZ = TE%(TX + X,TY + Y)
1130  X1 = 65 + (X + 1) * 50
1140  Y1 = (Y + 1) * 50
1145 REM ZZ   Description
1146 REM 1    ??
1146 REM 2    ??
1147 REM 3    Town
1148 REM 4    Dungeon
1149 REM 5    Castle
1150  IF ZZ = 2 THEN HPLOT X1 + 20,Y1 + 20 TO X1 + 30,Y1 + 20 TO X1 + 30 ,Y1 + 30 TO X1 + 20,Y1 + 30 TO X1 + 20,Y1 + 20
1160  IF ZZ = 3 THEN HPLOT X1 + 10,Y1 + 10 TO X1 + 20,Y1 + 10 TO X1 + 20 ,Y1 + 40 TO X1 + 10,Y1 + 40 TO X1 + 10,Y1 + 30
1170  IF ZZ = 3 THEN HPLOT X1 + 40,Y1 + 30 TO X1 + 40,Y1 + 40 TO X1 + 30,Y1 + 40 TO X1 + 30,Y1 + 10 TO X1 + 40,Y1 + 10
1180  IF ZZ = 3 THEN HPLOT X1 + 40,Y1 + 20 TO X1 + 10,Y1 + 20 TO X1 + 10,Y1 + 10
1190  IF ZZ = 4 THEN HPLOT X1 + 20,Y1 + 20 TO X1 + 30,Y1 + 30
1200   HPLOT X1 + 20,Y1 + 30 TO X1 + 30,Y1 + 20
1210  IF ZZ = 5 THEN HPLOT X1,Y1 TO X1 + 50,Y1 TO X1 + 50,Y1 + 50 TO X1, Y1 + 50 TO X1,Y1560
1220   HPLOT X1 + 10,Y1 + 10 TO X1 + 10,Y1 + 40 TO X1 + 40,Y1 + 40 TO X1 + 40,Y1 + 10 TO X1 + 10,Y1 + 10 TO X1 + 40,Y1 + 40
1230   HPLOT X1 + 10,Y1 + 40 TO X1 + 40,Y1 + 10
1240  IF ZZ = 1 THEN HPLOT X1 + 10,Y1 + 50 TO X1 + 10,Y1 + 40 TO X1 + 20 ,Y1 + 30 TO X1 + 40,Y1 + 30 TO X1 + 40,Y1 + 50
1250  HPLOT X1,Y1 + 10 TO X1 + 10,Y1 + 10
1260   HPLOT X1 + 50,Y1 + 10 TO X1 + 40,Y1 + 10
1270   HPLOT X1, Y1 + 40 TO X1 + 10,Y1 + 40
1280   HPLOT X1 + 40,Y1 + 40 TO X1 + 50,Y1 + 40
1290  IF ZZ = 1 THEN HPLOT X1 + 10,Y1 TO X1 + 10,Y1 + 20 TO X1 + 20,Y1 + 20 TO X1 + 20,Y1 + 30 TO X1 + 30,Y1 + 30 TO X1 + 30,Y1 + 10 TO X1 + 40,Y1 + 10 TO X1 + 40,Y1
1300  NEXT
1310   NEXT
1320  RETURN
1330  HGR
1340  DI = 0
1350   HCOLOR= 3
1360  CE = DN%(PX + DX * DI,PY + DY * DI)
1370  LE = DN%(PX + DX * DI + DY,PY + DY * DI - DX)
1380  RI = DN%(PX + DX * DI - DY,PY + DY * DI + DX)
1390  L1 = PE%(DI,0)
1400  R1 = PE%(DI,1)
1410  T1 = PE%(DI,2)
1420  B1 = PE%(DI,3)
1430   L2 = PE%(DI + 1,0)
1440  R2 = PE%(DI + 1,1)
1450  T2 = PE%(DI + 1,2)
1460  B2 = PE%(DI + 1,3)
1470  CE = INT (CE)
1480  LE = INT (LE)
1490  RI = INT (RI)
1500  MC = INT (CE / 10)
1510  CE = CE - MC * 10
1520  LE = INT ((LE / 10 - INT (LE / 10)) * 10 + .1)
1530  RI = INT ((RI / 10 - INT (RI / 10 )) * 10 + .1)
1540  IF DI = 0 THEN 6920
1550  IF CE = 1 OR CE = 3 OR CE = 4 THEN HPLOT L1,T1 TO R1,T1 TO R1,B1 TO L1,B1 TO L1,T1
1560  IF CE = 1 OR CE = 3 THEN EN = 1
1570   GOTO 8920
1580  IF CE = 4 THEN HPLOT CD%(DI,0),CD%(DI,3) TO CD%(DI,0),CD%(DI ,2) TO CD%(DI,1),CD%(DI,2) TO CD%(DI,1),CD%(DI,3)
1590  EN = 1
1600   GOTO 8920
1610  IF LE = 1 OR LE = 3 OR LE = 4 THEN HPLOT L1,T1 TO L2,T2
1620   HPLOT L1,B1 TO L2,B2
1630  IF RI = 1 OR RI = 3 OR RI = 4 THEN HPLOT R1,T1 TO R2,T2
1640   HPLOT R1,B1 TO R2,B2
1650  IF LE = 4 AND DI > 0 THEN HPLOT LD%(DI,0),LD%(DI,4) TO LD%(DI,0),LD%(DI,2) TO LD%(DI,1),LD%(DI,3) TO LD%(DI,1),LD%(DI,5)
1660  IF LE = 4 AND DI = 0 THEN HPLOT 0,LD%(DI,2) - 3 TO LD%(DI,1), LD%(DI,3) TO LD%(DI,1),LD%(DI,5)
1670  IF RI = 4 AND DI > 0 THEN HPLOT 279 - LD%(DI,0),LD%(DI,4) TO 279 - LD%(DI,0),LD%(DI,2) TO 279 - LD%(DI,1),LD%(DI,3) TO 279 - LD%(DI,1),LD%(DI,5)
1680  IF RI = 4 AND DI = 0 THEN HPLOT 279,LD%(DI,2) - 3 TO 279 - LD% (DI,1),LD%(DI,3) TO 279 - LD%(DI,1),LD%(DI,5)
1690  IF LE = 3 OR LE = 1 OR LE = 4 THEN 7820
1700  IF DI < > 0 THEN HPLOT L1,T1 TO L1,B1
1710  HPLOT L1,T2 TO L2,T2 TO L2,B2 TO L1,B2
1720  IF RI = 3 OR RI = 1 OR RI = 4 THEN 8120
1730  IF DI < > 0 THEN HPLOT R1,T1 TO R1,B1
1740  HPLOT R1,T2 TO R2,T2 TO R2,B2 TO R1,B2
1750  IF CE = 7 OR CE = 9 THEN HPLOT FT%(DI,0),FT%(DI,4) TO FT%(DI,2),FT%(DI,5) TO FT%(DI,3),FT%(DI,5) TO FT%(DI,1),FT%(DI,4) TO FT%(DI,0),FT%(DI,4)
1760  IF CE = 8 THEN HPLOT FT%(DI,0),158 - FT%(DI,4) TO FT%(DI,2),158 - FT%(DI,5) TO FT%(DI,3),158 - FT%(DI,5) TO FT%(DI,1),158 - FT%(DI,4) TO FT%(DI,0),158 - FT%(DI,4)
1770  IF CE = 7 OR CE = 8 THEN BA = LA(DI,3)
1780  TP = LA(DI,2)
1790  LX = LA(DI,0)
1800  RX = LA(DI,1)
1810   HPLOT LX,BA TO LX,TP
1820   HPLOT RX,TP TO RX,BA
1830  IF CE = 7 OR CE = 8 THEN Y1 = (BA * 4 + TP) / 5
1840  Y2 = (BA * 3 + TP * 2) / 5
1850  Y3 = (BA * 2 + TP * 3) / 5
1860  Y4 = (BA + TP * 4) / 5
1870   HPLOT LX,Y1 TO RX,Y1
1880   HPLOT LX,Y2 TO RX,Y2
1890   HPLOT LX,Y3 TO RX,Y3
1900   HPLOT LX ,Y4 TO RX,Y4
1910  IF DI > 0 AND CE = 5 THEN HPLOT 139 - 10 / DI,PE%(DI,3) TO 139 - 10 / DI,PE%(DI,3) - 10 / DI TO 139 + 10 / DI,PE%(DI,3) - 10 / DI TO 139 + 10 / DI,PE%(DI,3) TO 139 - 10 / DI,PE%(DI,3)
1920  IF CE = 5 AND DI > 0 THEN INVERSE
1930   PRINT "CHEST!"
1940   NORMAL
1950  IF DI > 0 AND CE = 5 THEN HPLOT 139 - 10 / DI,PE%(DI,3) - 10 / DI TO 139 - 5 / DI,PE%(DI,3) - 15 / DI TO 139 + 15 / DI,PE%(DI,3) - 15 / DI TO 139 + 15 / DI,PE%(DI,3) - 5 / DI TO 139 + 10 / DI,PE%(DI,3)
1960  IF DI > 0 AND CE = 5 THEN HPLOT 139 + 10 / DI,PE%(DI,3) - 10 / DI TO 139 + 15 / DI,PE%(DI,3) - 15 / DI
1970  IF MC < 1 THEN 1700
1980  B = 79 + YY%(DI)
1990  C = 139
2000  INVERSE
2010   IF MC = 8 THEN PRINT "CHEST!";
2020   CALL - 868
2030   PRINT
2040   NORMAL
2050   GOTO 9320
2060  PRINT M$(MC);
2070   CALL - 868
2080   PRINT
2090   NORMAL
2100  IF DI = 0 THEN 1700
2110  ON MC GOTO 9620,1040,1080,1140,1220,1300,1370,1420,1460,1590
2120  GOTO 1700
2130  HPLOT C - 23 / DI,B TO C - 15 / DI,B TO C - 15 / DI,B - 15 / DI TO C - 8 / DI,B - 30 / DI TO C + 8 / DI,B - 30 / DI TO C + 15 / DI,B - 15 / DI TO C + 15 / DI,B TO C + 23 / DI,B
2140  HPLOT C,B - 26 / DI TO C,B - 65 / DI
2150   HPLOT C - 2 / DI + .5,B - 38 / DI TO C + 2 / DI + .5,B - 38 / DI
2160   HPLOT C - 3 / DI + .5,B - 45 / DI TO C + 3 / DI + .5,B - 45 / DI
2170   HPLOT C - 5 / DI + .5,B - 53 / DI TO C + 5 / DI + .5,B - 53 / DI
2180  HPLOT C - 23 / DI,B - 56 / DI TO C - 30 / DI,B - 53 / DI TO C - 23 / DI,B - 45 / DI TO C - 23 / DI,B - 53 / DI TO C - 8 / DI,B - 38 / DI
2190  HPLOT C - 15 / DI,B - 45 / DI TO C - 8 / DI,B - 60 / DI TO C + 8 / DI,B - 60 / DI TO C + 15 / DI,B - 45 / DI
2200   HPLOT C + 15 / DI,B - 42 / DI TO C + 15 / DI,B - 57 / DI
2210   HPLOT C + 12 / DI,B - 45 / DI TO C + 20 / DI,B - 45 / DI
2220  HPLOT C,B - 75 / DI TO C - 5 / DI + .5,B - 80 / DI TO C - 8 / DI,B - 75 / DI TO C - 5 / DI + .5,B - 65 / DI TO C + 5 / DI + .5,B - 65 / DI TO C + 5 / DI + .5,B - 68 / DI TO C - 5 / DI + .5,B - 68 / DI TO C - 5 / DI + .5,B - 65 / DI
2230  HPLOT TO C + 5 / DI + .5,B - 65 / DI TO C + 8 / DI,B - 75 / DI TO C + 5 / DI + .5,B - 80 / DI TO C - 5 / DI + .5,B - 80 / DI
2240   HPLOT C - 5 / DI + .5,B - 72 / DI
2250   HPLOT C + 5 / DI + .5,B - 72 / DI
2260  GOTO 1700
2270  HPLOT C,B - 56 / DI TO C,B - 8 / DI TO C + 10 / DI,B TO C + 30 / DI ,B TO C + 30 / DI,B - 45 / DI TO C + 10 / DI,B - 64 / DI TO C,B - 56 / DI
2280  HPLOT TO C - 10 / DI,B - 64 / DI TO C - 30 / DI,B - 45 / DI TO C - 30 / DI,B TO C - 10 / DI,B TO C,B - 8 / DI
2290  HPLOT C - 10 / DI,B - 64 / DI TO C - 10 / DI,B - 75 / DI TO C,B - 83 / DI TO C + 10 / DI,B - 75 / DI TO C,B - 79 / DI TO C - 10 / DI,B - 75 / DI TO C,B - 60 / DI TO C + 10 / DI,B - 75 / DI TO C + 10 / DI,B - 64 / DI
2300  GOTO 1700
2310  HPLOT C + 5 / DI,B - 30 / DI TO C,B - 25 / DI TO C - 5 / DI,B - 30 / DI TO C - 15 / DI,B - 5 / DI TO C - 10 / DI,B TO C + 10 / DI,B TO C + 15 / DI,B - 5 / DI
2320  HPLOT TO C + 20 / DI,B - 5 / DI TO C + 10 / DI,B TO C + 15 / DI,B - 5 / DI TO C + 5 / DI,B - 30 / DI TO C + 10 / DI,B - 40 / DI TO C + 3 / DI + .5,B - 35 / DI
2330  HPLOT TO C - 3 / DI + .5,B - 35 / DI TO C - 10 / DI ,B - 40 / DI TO C - 5 / DI,B - 30 / DI
2340  HPLOT C - 5 / DI,B - 33 / DI TO C - 3 / DI + .5,B - 30 / DI
2350   HPLOT C + 5 / DI,B - 33 / DI TO C + 3 / DI + .5,B - 30 / DI
2360   HPLOT C - 5 / DI,B - 20 / DI TO C - 5 / DI,B - 15 / DI
2370  HPLOT C + 5 / DI,B - 20 / DI TO C + 5 / DI,B - 15 / DI
2380   HPLOT C - 7 / DI,B - 20 / DI TO C - 7 / DI,B - 15 / DI
2390   HPLOT C + 7 / DI,B - 20 / DI TO C + 7 / DI,B - 15 / DI
2400  GOTO 1700
2410  HPLOT C,B TO C - 15 / DI,B TO C - 8 / DI,B - 8 / DI TO C - 8 / DI,B - 15 / DI TO C - 15 / DI,B - 23 / DI TO C - 15 / DI,B - 15 / DI TO C - 23 / DI,B - 23 / DI
2420  HPLOT TO C - 23 / DI,B - 45 / DI TO C - 15 / DI,B - 53 / DI TO C - 8 / DI,B - 53 / DI TO C - 15 / DI,B - 68 / DI TO C - 8 / DI,B - 75 / DI TO C,B - 75 / DI
2430  HPLOT C,B TO C + 15 / DI,B TO C + 8 / DI,B - 8 / DI TO C + 8 / DI,B - 15 / DI TO C + 15 / DI,B - 23 / DI TO C + 15 / DI,B - 15 / DI TO C + 23 / DI,B - 23 / DI
2440  HPLOT TO C + 23 / DI,B - 45 / DI TO C + 15 / DI,B - 53 / DI TO C + 8 / DI,B - 53 / DI TO C + 15 / DI,B - 68 / DI TO C + 8 / DI,B - 75 / DI TO C,B - 75 / DI
2450  HPLOT C - 15 / DI,B - 68 / DI TO C + 15 / DI,B - 68 / DI
2460   HPLOT C - 8 / DI,B - 53 / DI TO C + 8 / DI,B - 53 / DI
2470   HPLOT C - 23 / DI,B - 15 / DI TO C + 8 / DI,B - 45 / DI
2480  HPLOT C - 8 / DI,B - 68 / DI TO C,B - 60 / DI TO C + 8 / DI,B - 68 / DI TO C + 8 / DI,B - 60 / DI TO C - 8 / DI,B - 60 / DI TO C - 8 / DI ,B - 68 / DI
2490  HPLOT C,B - 38 / DI TO C - 8 / DI,B - 38 / DI TO C + 8 / DI,B - 53 / DI TO C + 8 / DI,B - 45 / DI TO C + 15 / DI,B - 45 / DI TO C,B - 30 / DI TO C,B - 38 / DI
2500  GOTO 1700
2510  HPLOT C - 10 / DI,B - 15 / DI TO C - 10 / DI,B - 30 / DI TO C - 15 / DI,B - 20 / DI TO C - 15 / DI,B - 15 / DI TO C - 15 / DI,B TO C + 15 / DI,B TO C + 15 / DI,B - 15 / DI TO C - 15 / DI,B - 15 / DI
2520  HPLOT C - 15 / DI,B - 10 / DI TO C + 15 / DI,B - 10 / DI
2530   HPLOT C - 15 / DI,B - 5 / DI TO C + 15 / DI,B - 5 / DI
2540  HPLOT C,B - 15 / DI TO C - 5 / DI,B - 20 / DI TO C - 5 / DI,B - 35 / DI TO C + 5 / DI,B - 35 / DI TO C + 5 / DI,B - 20 / DI TO C + 10 / DI,B - 15 / DI
2550  HPLOT C - 5 / DI,B - 20 / DI TO C + 5 / DI,B - 20 / DI
2560   HPLOT C - 5 / DI,B - 25 / DI TO C + 5 / DI,B - 25 / DI
2570   HPLOT C - 5 / DI,B - 30 / DI TO C + 5 / DI,B - 30 / DI
2580  HPLOT C - 10 / DI,B - 35 / DI TO C - 10 / DI,B - 40 / DI TO C - 5 / DI,B - 45 / DI TO C + 5 / DI,B - 45 / DI TO C + 10 / DI,B - 40 / DI TO C + 10 / DI,B - 35 / DI
2590  HPLOT C - 10 / DI,B - 40 / DI TO C,B - 45 / DI TO C + 10 / DI,B - 40 / DI
2600  HPLOT C - 5 / DI,B - 40 / DI TO C + 5 / DI,B - 40 / DI TO C + 15 / DI,B - 30 / DI TO C,B - 40 / DI TO C - 15 / DI,B - 30 / DI TO C - 5 / DI + .5,B - 40 / DI
2610  GOTO 1700
2620  HPLOT C - 20 / DI,79 - YY%(DI) TO C - 20 / DI,B - 88 / DI TO C - 10 / DI,B - 83 / DI TO C + 10 / DI,B - 83 / DI TO C + 20 / DI,B - 88 / DI TO C + 20 / DI,79 - YY%(DI) TO C - 20 / DI,79 - YY%(DI)
2630  HPLOT C - 20 / DI,B - 88 / DI TO C - 30 / DI,B - 83 / DI TO C - 30 / DI,B - 78 / DI
2640   HPLOT C + 20 / DI,B - 88 / DI TO C + 30 / DI,B - 83 / DI TO C + 40 / DI,B - 83 / DI
2650  HPLOT C - 15 / DI,B - 86 / DI TO C - 20 / DI,B - 83 / DI TO C - 20 / DI,B - 78 / DI TO C - 30 / DI,B - 73 / DI TO C - 30 / DI,B - 68 / DI TO C - 20 / DI,B - 63 / DI
2660  HPLOT C - 10 / DI,B - 83 / DI TO C - 10 / DI,B - 58 / DI TO C,B - 50 / DI
2670   HPLOT C + 10 / DI,B - 83 / DI TO C + 10 / DI,B - 78 / DI TO C + 20 / DI,B - 73 / DI TO C + 20 / DI,B - 40 / DI
2680  HPLOT C + 15 / DI,B - 85 / DI TO C + 20 / DI,B - 78 / DI TO C + 30 / DI,B - 76 / DI TO C + 30 / DI,B - 60 / DI
2690  HPLOT C,B - 83 / DI TO C,B - 73 / DI TO C + 10 / DI,B - 68 / DI TO C + 10 / DI,B - 63 / DI TO C,B - 58 / DI
2700  GOTO 1700
2710  HPLOT C + 5 / DI + .5,B - 10 / DI TO C - 5 / DI + .5,B - 10 / DI TO C,B - 15 / DI TO C + 10 / DI,B - 20 / DI TO C + 5 / DI + .5,B - 15 / DI TO C + 5 / DI + .5,B - 10 / DI
2720  HPLOT TO C + 7 / DI + .5,B - 6 / DI TO C + 5 / DI + .5,B - 3 / DI TO C - 5 / DI + .5,B - 3 / DI TO C - 7 / DI + .5,B - 6 / DI TO C - 5 / DI + .5,B - 10 / DI
2730  HPLOT C + 2 / DI + .5,B - 3 / DI TO C + 5 / DI + .5,B TO C + 8 / DI ,B
2740   HPLOT C - 2 / DI + .5,B - 3 / DI TO C - 5 / DI + .5,B TO C - 8 / DI,B
2750   HPLOT C + 3 / DI + .5,B - 8 / DI
2760  HPLOT C - 3 / DI + .5,B - 8 / DI
2770   HPLOT C + 3 / DI + .5,B - 5 / DI TO C - 3 / DI + .5,B - 5 / DI
2780  GOTO 1700
2790  HPLOT 139 - 10 / DI,PE%(DI,3) TO 139 - 10 / DI,PE%(DI,3) - 10 / DI TO 139 + 10 / DI,PE%(DI,3) - 10 / DI TO 139 + 10 / DI,PE%(DI,3) TO 139 - 10 / DI,PE%(DI,3)
2800  HPLOT 139 - 10 / DI,PE%(DI,3) - 10 / DI TO 139 - 5 / DI,PE%(DI,3) - 15 / DI TO 139 + 15 / DI,PE%(DI,3) - 15 / DI TO 139 + 15 / DI,PE%(DI,3) - 5 / DI TO 139 + 10 / DI,PE%(DI,3)
2810  HPLOT 139 + 10 / DI,PE%(DI,3) - 10 / DI TO 139 + 15 / DI,PE%( DI,3) - 15 / DI
2820  GOTO 1700
2830  HPLOT C - 14 / DI,B - 46 / DI TO C - 12 / DI,B - 37 / DI TO C - 20 / DI,B - 32 / DI TO C - 30 / DI,B - 32 / DI
2840  HPLOT TO C - 22 / DI,B - 24 / DI TO C - 40 / DI,B - 17 / DI TO C - 40 / DI,B - 7 / DI TO C - 38 / DI ,B - 5 / DI TO C - 40 / DI,B - 3 / DI TO C - 40 / DI,B
2850  HPLOT TO C - 36 / DI,B TO C - 34 / DI,B - 2 / DI TO C - 32 / DI,B TO C - 28 / DI,B TO C - 28 / DI,B - 3 / DI TO C - 30 / DI,B - 5 / DI TO C - 28 / DI,B - 7 / DI TO C - 28 / DI,B - 15 / DI TO C,B - 27 / DI
2860  HPLOT C + 14 / DI,B - 46 / DI TO C + 12 / DI,B - 37 / DI TO C + 20 / DI,B - 32 / DI TO C + 30 / DI,B - 32 / DI
2870  HPLOT TO C + 22 / DI,B - 24 / DI TO C + 40 / DI,B - 17 / DI TO C + 40 / DI,B - 7 / DI TO C + 38 / DI ,B - 5 / DI TO C + 40 / DI,B - 3 / DI TO C + 40 / DI,B
2880  HPLOT TO C + 36 / DI,B TO C + 34 / DI,B - 2 / DI TO C + 32 / DI,B TO C + 28 / DI,B TO C + 28 / DI,B - 3 / DI TO C + 30 / DI,B - 5 / DI TO C + 28 / DI,B - 7 / DI TO C + 28 / DI,B - 15 / DI TO C,B - 27 / DI
2890  HPLOT C + 6 / DI,B - 48 / DI TO C + 38 / DI,B - 41 / DI TO C + 40 / DI,B - 42 / DI TO C + 18 / DI,B - 56 / DI
2900  HPLOT TO C + 12 / DI,B - 56 / DI TO C + 10 / DI,B - 57 / DI TO C + 8 / DI,B - 56 / DI TO C - 8 / DI, B - 56 / DI TO C - 10 / DI,B - 58 / DI TO C + 14 / DI,B - 58 / DI TO C + 16 / DI,B - 59 / DI
2910  HPLOT TO C + 8 / DI,B - 63 / DI TO C + 6 / DI,B - 63 / DI TO C + 2 / DI + .5,B - 70 / DI TO C + 2 / DI + .5,B - 63 / DI
2920  HPLOT TO C - 2 / DI + .5,B - 63 / DI TO C - 2 / DI + .5,B - 70 / DI TO C - 6 / DI,B - 63 / DI TO C - 8 / DI,B - 63 / DI TO C - 16 / DI,B - 59 / DI TO C - 14 / DI,B - 58 / DI
2930  HPLOT TO C - 10 / DI,B - 57 / DI TO C - 12 / DI,B - 56 / DI TO C - 18 / DI,B - 56 / DI TO C - 36 / DI,B - 47 / DI
2940  HPLOT TO C - 36 / DI,B - 39 / DI TO C - 28 / DI,B - 41 / DI TO C - 28 / DI,B - 46 / DI TO C - 20 / DI,B - 50 / DI TO C - 18 / DI,B - 50 / DI TO C - 14 / DI,B - 46 / DI
2950  GOTO 3040
2960  HPLOT C + 6 / DI,B - 60 / DI TO C + 30 / DI,B - 90 / DI TO C + 60 / DI,B - 30 / DI TO C + 60 / DI,B - 10 / DI TO C + 30 / DI,B - 40 / DI TO C + 15 / DI,B - 40 / DI
2970  HPLOT C - 6 / DI,B - 60 / DI TO C - 30 / DI,B - 90 / DI TO C - 60 / DI,B - 30 / DI TO C - 60 / DI,B - 10 / DI TO C - 30 / DI,B - 40 / DI TO C - 15 / DI,B - 40 / DI
2980  HPLOT C,B - 25 / DI TO C + 6 / DI,B - 25 / DI TO C + 10 / DI,B - 20 / DI TO C + 12 / DI,B - 10 / DI TO C + 10 / DI,B - 6 / DI TO C + 10 / DI,B TO C + 14 / DI,B TO C + 15 / DI,B - 5 / DI TO C + 16 / DI,B TO C + 20 / DI,B
2990  HPLOT TO C + 20 / DI,B - 6 / DI TO C + 18 / DI,B - 10 / DI TO C + 18 / DI,B - 20 / DI TO C + 15 / DI,B - 30 / DI TO C + 15 / DI,B - 45 / DI TO C + 40 / DI,B - 60 / DI TO C + 40 / DI,B - 70 / DI
3000  HPLOT TO C + 10 / DI,B - 55 / DI TO C + 6 / DI,B - 60 / DI TO C + 10 / DI,B - 74 / DI TO C + 6 / DI,B - 80 / DI TO C + 4 / DI + .5,B - 80 / DI TO C + 3 / DI + .5,B - 82 / DI TO C + 2 / DI + .5,B - 80 / DI TO C,B - 80 / DI
3010  HPLOT C,B - 25 / DI TO C - 6 / DI,B - 25 / DI TO C - 10 / DI,B - 20 / DI TO C - 12 / DI,B - 10 / DI TO C - 10 / DI,B - 6 / DI TO C - 10 / DI,B TO C - 14 / DI,B TO C - 15 / DI,B - 5 / DI TO C - 16 / DI,B TO C - 20 / DI,B
3020  HPLOT TO C - 20 / DI,B - 6 / DI TO C - 18 / DI,B - 10 / DI TO C - 18 / DI,B - 20 / DI TO C - 15 / DI,B - 30 / DI TO C - 15 / DI,B - 45 / DI TO C - 40 / DI,B - 60 / DI TO C - 40 / DI,B - 70 / DI
3030  HPLOT TO C - 10 / DI,B - 55 / DI TO C - 6 / DI,B - 60 / DI TO C - 10 / DI,B - 74 / DI TO C - 6 / DI,B - 80 / DI TO C - 4 / DI + .5,B - 80 / DI TO C - 3 / DI + .5,B - 82 / DI TO C - 2 / DI + .5,B - 80 / DI TO C,B - 80 / DI
3040  HPLOT C - 6 / DI,B - 25 / DI TO C,B - 6 / DI TO C + 10 / DI,B TO C + 4 / DI + .5,B - 8 / DI TO C + 6 / DI,B - 25 / DI
3050        HPLOT C - 40 / DI, B - 64 / DI TO C - 40 / DI,B - 90 / DI TO C - 52 / DI,B - 80 / DI TO C - 52 / DI,B - 40 / DI
3060  HPLOT C + 40 / DI,B - 86 / DI TO C + 38 / DI,B - 92 / DI TO C + 42 / DI,B - 92 / DI TO C + 40 / DI,B - 86 / DI TO C + 40 / DI,B - 50 / DI
3070  HPLOT C + 4 / DI + .5,B - 70 / DI TO C + 6 / DI,B - 74 / DI
3080   HPLOT C - 4 / DI + .5,B - 70 / DI TO C - 6 / DI,B - 74 / DI
3090   HPLOT C,B - 64 / DI TO C,B - 60 / DI
3100  GOTO 1700
3110  IF EN = 1 THEN EN = 0
3120  RETURN
3130  DI = DI + 1
3140   GOTO 6120
3150  ZZ = RND ( - ABS (LN) - TX * 10 - TY * 1000 + IO * 31.4)
3160  FOR X = 1 TO 9
3170   FOR Y = 1 TO 9
3180  DN%(X,Y) = 0
3190   NEXT
3200   NEXT
3210  FOR X = 0 TO 10
3220  DN%(X,0) = 1
3230  DN%(X,10) = 1
3240  DN%(0,X) = 1
3250  DN%(10, X) = 1
3260   NEXT
3270  FOR X = 2 TO 8 STEP 2
3280   FOR Y = 1 TO 9
3290  DN%(X,Y) = 1
3300  DN%(Y,X) = 1
3310   NEXT
3320   NEXT
3330  FOR X = 2 TO 8 STEP 2
3340   FOR Y = 1 TO 9 STEP 2
3350  IF RND (1) > .95 THEN DN%(X,Y) = 2
3360  IF RND (1) > .95 THEN DN%(Y,X) = 2
3370  IF RND (1) > .6 THEN DN%(Y,X) = 3
3380  IF RND (1) > .6 THEN DN%(X,Y) = 3
3390  IF RND (1) > .6 THEN DN%(X,Y) = 4
3400  IF RND (1) > .6 THEN DN%(Y,X) = 4
3410  IF RND (1) > .97 THEN DN%(Y,X) = 9
3420  IF RND (1) > .97 THEN DN%(X,Y) = 9
3430  IF RND (1) > .94 THEN DN%(X,Y) = 5
3440  IF RND (1) > .94 THEN DN%(Y,X) = 5
3450  NEXT
3460   NEXT
3470  DN%(2,1) = 0
3480   IF IO / 2 = INT (IN / 2) THEN DN%(7,3) = 7
3490  DN%(3,7) = 8
3500  IF IO / 2 < > INT (IN / 2) THEN DN%(7,3) = 8
3510  DN%(3,7) = 7
3520  IF IO = 1 THEN DN%(1,1) = 8
3530  DN%(7,3) = 0
3540  GOSUB 2930
3550  RETURN
3560  VTAB (24)
3570   PRINT "COMMAND? ";
3580   CALL - 868
3590  X = PEEK (-16384)
3600   IF X < 128 THEN 1940
3610  Q = FRE (0)
3620  POKE - 16368,0
3630  IF X = 141 THEN ON SGN (IN) + 1 GOTO 2170,2190
3640  IF X = 149 THEN ON SGN (IN) + 1 GOTO 2260,2280
3650  IF X = 136 THEN ON SGN (IN) + 1 GOTO 2310,2330
3660  IF X = 175 THEN ON SGN (IN) + 1 GOTO 2360,2380
3670  IF X = 216 THEN ON SGN (IN) + 1 GOTO 2390,2430
3680  IF X = 193 OR X = 155 THEN ON SGN (IN) + 1 GOTO 2520,2530
3690  IF X = 160 THEN PRINT "PASS"
3700   GOTO 2090
3710  IF X = 211 THEN 2920
3720  IF X = 208 THEN IF PA = 1 THEN PA = 0
3730   PRINT "PAUSE OFF"
3740   GOTO 1930
3750  IF X = 208 THEN IF PA = 0 THEN PA = 1
3760   PRINT "PAUSE ON"
3770   GOTO 1930
3780  PRINT "HUH?"
3790   GOTO 1930
3800  REM ------------------ STARVE ------------------
3810  PW(0) = PW(0) - 1 + SGN (IN) * .9
3820   IF PW(0) < 0 THEN C(0) = 0
3830   PRINT
3840   PRINT "YOU HAVE STARVED!!!!!"
3850   GOTO 2120
3860  POKE 33,40
3870   VTAB (22)
3880   HTAB (30)
3890   PRINT "FOOD=";PW(0);
3900   CALL - 868
3910   VTAB (23)
3920   HTAB (30)
3930   PRINT "H.P.=";C(0);
3940   CALL - 868
3950   VTAB (24)
3960   HTAB (30)
3970   PRINT "GOLD=";C(5);
3980   CALL - 868
3990   POKE 33,29
4000   HTAB (1)
4010  PW(0) = INT (PW(0) * 10) / 10
4020  IF C(0) < = 0 THEN 3410
4030  IF IO > 0 THEN GOSUB 3090
4040   IF C(0) < = 0 THEN 2120
4050  POKE 33,40
4060   VTAB (22)
4070   HTAB (30)
4080   PRINT "FOOD=";PW(0);
4090   CALL - 868
4100   VTAB (23)
4110   HTAB (30)
4120   PRINT "H.P.=";C(0);
4130   CALL - 868
4140   VTAB (24)
4150   HTAB (30)
4160   PRINT "GOLD=";C(5);
4170   CALL - 868
4180   POKE 33,29
4190   HTAB (1)
4200  IF IO = 0 THEN GOSUB 4630
4210   GOTO 1930
4220  IF IO > 0 THEN GOSUB 6020
4230   GOTO 1930
4240  PRINT "NORTH"
4250   IF TE%(TX,TY - 1) = 1 THEN PRINT "YOU CAN'T PASS THE MOUNTAINS"
4260   GOTO 2090
4270  TY = TY - 1
4280   GOTO 2090
4290  IF DN%(PX + DX,PY + DY) < > 1 AND DN%(PX + DX,PY + DY) < 10 THEN PX = PX + DX
4300  PY = PY + DY
4310  PRINT "FORWARD"
4320  IF DN%(PX,PY) = 2 THEN PRINT "AAARRRGGGHHH!!! A TRAP!"
4330  C(0)= C( 0) - INT ( RND (1) * IO + 3)
4340  MR = 1
4350  IN = IO + 1
4360   PRINT "FALLING TO LEVEL ";IN
4370   GOSUB 1720
4380   GOTO 2090
4390  Z = 0
4400  IF DN%(PX,PY) = 5 THEN DN%(PX,PY) = 0
4410   PRINT "GOLD!!!!!"
4420  Z = INT ( RND (1) * 5 * IO + IN)
4430   PRINT Z;"-PIECES OF EIGHT"
4440  C(5) = C( 5) + Z
4450  IF Z > 0 THEN Z = INT ( RND (1) * 6)
4460   PRINT "AND A ";W$(Z)
4470  PW(Z) = PW(Z) + 1
4480   GOTO 2090
4490  GOTO 2090
4500  PRINT "EAST"
4510   IF TE%(TX + 1,TY) = 1 THEN PRINT "YOU CAN'T PASS T HE MOUNTAINS"
4520   GOTO 2090
4530  TX = TX + 1
4540   GOTO 2090
4550  PRINT "TURN RIGHT"
4560  IF DX < > 0 THEN DY = DX
4570  DX = 0
4580   GOTO 2090
4590  DX = - DY
4600  DY = 0
4610   GOTO 2090
4620  PRINT "WEST"
4630   IF TE%(TX - 1,TY) = 1 THEN PRINT "YOU CAN'T PASS T HE MOUNTAINS"
4640   GOTO 2090
4650  TX = TX - 1
4660   GOTO 2090
4670  PRINT "TURN LE"
4680  IF DX < > 0 THEN DY = - DX
4690  DX = 0
4700   GOTO 2090
4710  DX = DY
4720  DY = 0
4730   GOTO 2090
4740  PRINT "SOUTH"
4750   IF TE%(TX,TY + 1) = 1 THEN PRINT "YOU CAN'T PASS THE MOUNTAINS"
4760   GOTO 2090
4770  TY = TY + 1
4780   GOTO 2090
4790  PRINT "TURN AROUND"
4800  DX = - DX
4810  DY = - DY
4820   GOTO 2090
4830  IF TE%(TX,TY) = 3 THEN GOSUB 3960
4840   GOSUB 4060
4850   GOTO 2090
4860  IF TE%(TX,TY) = 4 AND IO = 0 THEN PRINT "GO DUNGEON"
4870   PRINT "P LEASE WAIT "
4880  IN = 1
4890   GOSUB 1720
4900  DX = 1
4910  DY = 0
4920  PX = 1
4930  PY = 1
4940   GOTO 2090
4950  IF TE%(TX,TY) = 5 THEN 3510
4960  PRINT "HUH?"
4970   GOTO 1930
4980  IF DN%(PX,PY) < > 7 AND DN%(PX,PY) < > 9 THEN 2460
4990  PRINT "GO DOWN TO LEVEL ";IN + 1
5000  IO = IO + 1
5010   GOSUB 1720
5020  MR = 1
5030   GOTO 2090
5040  IF DN%(PX,PY) < > 8 THEN PRINT "HUH?"
5050   GOTO 2090
5060  IF IO = 1 THEN PRINT "LEAVE DUNGEON"
5070  IN = 0
5080   GOTO 2500
5090  PRINT "GO UP TO LEVEL ";IN - 1
5100  IO = IO - 1
5110   GOSUB 1720
5120  MR = 1
5130  IF IO = 0 THEN PRINT "THOU HAST GAINED"
5140   PRINT LK;" HIT POINTS"
5150  C (0) = C(0) + LK
5160  LK = 0
5170  GOTO 2090
5180  GOTO 2090
5190  MN = 0
5200  DA = 0
5210   PRINT "ATTACK"
5220   PRINT "WHICH WEAPON ";
5230   GET Q$
5240  IF Q$ = "R" THEN DA = 10
5250   PRINT "RAPIER"
5260   IF PW(1) < 1 THEN PRINT "NOT OWNED"
5270   GOTO 2530
5280  IF Q$ = "A" THEN DA = 5
5290   PRINT "AXE"
5300   IF PW(2) < 1 THEN PRINT "N OT OWNED"
5310   GOTO 2530
5320  IF Q$ = "S" THEN DA = 1
5330   PRINT "SHIELD"
5340   IF PW(3) < 1 THEN PRINT "NOT OWNED"
5350   GOTO 2530
5360  IF Q$ = "B" THEN DA = 4
5370   PRINT "BOW"
5380   IF PW(4) < 1 THEN PRINT "N OT OWNED"
5390   GOTO 2530
5400  IF Q$ = "M" THEN PRINT "MAGIC AMULET"
5410   GOTO 2790
5420  IF Q$ = "B" AND PT$ = "M" THEN PRINT "MAGES CAN'T USE BOWS!"
5430   GOTO 2530
5440  IF Q$ = "R" AND PT$ = "M" THEN PRINT "MAGES CAN'T USE RAPIERS!"
5450   GOTO 2530
5460  IF DA = 0 THEN PRINT "HANDS"
5470  IF DA = 5 OR DA = 4 THEN 2740
5480  MN = DN%(PX + DX,PY + DY) / 10
5490  MN = INT (MN)
5500  IF MN < 1 OR C(2) - RND (1) * 25 < MN + IO THEN PRINT "YOU MISSED"
5510   GOTO 2720
5520  PRINT "HIT!!! "
5530  DA = RND (1) * DA + C(1) / 5
5540  MZ%(MN,1) = MZ%( MN,1) - DA
5550  PRINT M$(MN);"'S HIT POINTS=";MZ%(MN,1)
5560  IF MZ%(MN,1) < 1 THEN PRINT "THOU HAST KILLED A ";M$(MN)
5570   PRINT " THOU SHALT RECEIVE"
5580  DA = INT (MN + IN)
5590   PRINT DA;" PIECES OF EIGHT"
5600  IF MZ%(MN,1) < 1 THEN C(5) = INT (C(5) + DA)
5610  DN%(ML%(MN,0),ML%(MN,1)) = DN%(ML%(MN,0),ML%(MN,1)) - 10 * MN
5620  MZ%(MN,0) = 0
5630  LK = LK + INT (MN * IO / 2)
5640   IF MN = TASK THEN TASK = - TASK
5650  IF PA = 1 THEN PRINT "-CR- TO CONT. ";
5660   INPUT Q$
5670  GOTO 2090
5680  IF DA = 5 THEN PRINT "TO THROW OR SWING
576  ";
5690   GET Q$
5700   IF Q$ < > " T" THEN PRINT "SWING"
5710   GOTO 2630
5720  IF DA = 5 THEN PRINT "THROW"
5730  PW(2) = PW(2) - 1
5740  FOR Y = 1 TO 5
5750   IF PX + DX * Y < 1 OR PX + DX * Y > 9 OR PY + DY * Y > 9 OR PY + DY * Y < 0 THEN 2640
5760  MN = DN%(PX + DX * Y,PY + DY * Y)
5770  MN = INT (MN / 10)
5780   IF MN > 0 THEN 2640
5790  NEXT
5800   GOTO 2640
5810  IF PW(5) < 1 THEN PRINT "NONE OWNED"
5820   GOTO 2530
5830  IF PT$ = "F" THEN Q = INT ( RND (1) * 4 + 1)
5840   GOTO 2830
5850  PRINT "1-LADDER-UP","2-LADDER-DN"
5860   PRINT "3-KILL","4-BAD??"
5870   PRINT "CHOICE ";
5880   GET Q$
5890  Q = VAL (Q$)
5900   PRINT Q
5910   IF Q < 1 OR Q > 4 THEN 2810
5920  IF RND (1) > .75 THEN PRINT "LAST CHARGE ON THIS AMULET!"
5930  PW(5) = PW(5) - 1
5940  ON Q GOTO 2840,2850,2860,2870
5950  PRINT "LADDER UP"
5960  DN%(PX,PY) = 8
5970   GOTO 2090
5980  PRINT "LADDER DOWN"
5990  DN%(PX,PY) = 7
6000   GOTO 2090
6010  PRINT "MAGIC ATTACK"
6020  DA = 10 + IN
6030   GOTO 2760
6040  ON INT ( RND (1) * 3 + 1) GOTO 2880,2900,2910
6050  PRINT "YOU HAVE BEEN TURNED"
6060   PRINT "INTO A TOAD!"
6070  FOR Z2 = 1 TO 4
6080  C(Z2) = 3
6090  C(Z2) = 3
6100   NEXT Z2
6110   GOTO 2090
6120  PRINT "YOU HAVE BEEN TURNED"
6130   PRINT "INTO A LIZARD MAN"
6140   FOR Y = 0 TO 4
6150  C(Y) = INT (C(Y) * 2.5)
6160   NEXT
6170   GOTO 2090
6180  PRINT "BACKFIRE"
6190  C(0) = C(0) / 2
6200   GOTO 2090
6210  GOSUB 3960
6220   HOME
6230   PRINT "PRESS -CR- TO CONTINUE";
6240   INPUT Q$
6250   TEXT
6260   HOME
6270   GOTO 2090
6280  NM = 0
6290   FOR X = 1 TO 10
6300  MZ%(X,0) = 0
6310  MZ%(X,1) = X + 3 + IN
6320  IF X - 2 > IO OR RND (1) > .4 THEN 3030
6330  ML%(X,0) = INT ( RND (1) * 9 + 1)
6340  ML%(X,1) = INT ( RND (1) * 9 + 1)
6350  IF DN%(ML%(X,0),ML%(X,1)) < > 0 THEN 2960
6360  IF ML%(X,0) = PX AND ML%(X,1) = PY THEN 2960
6370  DN%(ML%(X,0),ML%(X,1)) = X * 10
6380  MZ%(X,0) = 1
6390  NM = NM + 1
6400  MZ%(X,1) = X * 2 + IO * 2 * LV
6410  NEXT
6420   RETURN
6430  HPLOT C - 28 / DI,B - 41 / DI TO C + 30 / DI,B - 55 / DI
6440   HPLOT C + 28 / DI,B - 58 / DI TO C + 22 / DI,B - 56 / DI
6450  HPLOT TO C + 22 / DI,B - 53 / DI TO C + 28 / DI,B - 52 / DI TO C + 34 / DI,B - 54 / DI
6460   HPLOT C + 20 / DI,B - 50 / DI TO C + 26 / DI,B - 47 / DI
6470  HPLOT C + 10 / DI,B - 58 / DI TO C + 10 / DI,B - 61 / DI TO C + 4 / DI,B - 58 / DI
6480   HPLOT C - 10 / DI,B - 58 / DI TO C - 10 / DI,B - 61 / DI
6490  HPLOT TO C - 4 / DI,B - 58 / DI
6500   HPLOT C + 40 / DI,B - 9 / DI TO C + 50 / DI,B - 12 / DI TO C + 40 / DI,B - 7 / DI
6510  HPLOT C - 8 / DI,B - 25 / DI TO C + 6 / DI,B - 7 / DI TO C + 28 / DI,B - 7 / DI TO C + 28 / DI,B - 9 / DI TO C + 20 / DI,B - 9 / DI TO C + 6 / DI,B - 25 / DI
6520   GOTO 1700
6530  FOR MM = 1 TO 10
6540   IF MZ%(MM,0) = 0 THEN 3390
6550  RA = SQR ((PX - ML%(MM,0)) ^ 2 + (PY - ML%(MM,1)) ^ 2)
6560  IF MZ%(MM,1) < IO * LV THEN 3140
6570  IF RA < 1.3 THEN 3290
6580  IF MM = 8 AND RA < 3 THEN 3390
6590  X1 = SGN (PX - ML%(MM,0))
6600  Y1 = SGN (PY - ML%(MM,1))
6610  IF MZ%(MM,1) < IO * LV THEN X1 = - X1
6620  Y1 = - Y1
6630  IF Y1 = 0 THEN 3190
6640  D = DN%(ML%(MM,0),(ML%(MM,1) + Y1 + .5))
6650   IF D = 1 OR D > 9 OR D = 2 THEN 3190
6660  X1 = 0
6670   GOTO 3210
6680  Y1 = 0
6690   IF X1 = 0 THEN 3210
6700  D = DN%((ML%(MM,0) + X1 + .5),ML%(MM,1))
6710   IF D = 1 OR D > 9 OR D = 2 THEN X1 = 0
6720   GOTO 3250
6730  DN%(ML%(MM,0),ML%(MM,1)) = DN%(ML%(MM,0),ML%(MM,1)) - 10 * MM
6740  IF ML%(MM,0) + X1 = PX AND ML%(MM,1) + Y1 = PY THEN 3390
6750  ML%(MM,0) = ML%(MM,0) + X1
6760  ML%(MM,1) = ML%(MM,1) + Y1
6770  DN%(ML%(MM,0),ML%(MM,1)) = (DN%(ML%(MM,0),ML%(MM,1)) + 10 * MM + .5)
6780  IF X1 < > 0 OR Y1 < > 0 THEN 3390
6790  IF MZ%(MM,1) < IO * LV AND RA < 1.3 THEN 3290
6800  IF MZ%(MM,1) < IO * LV THEN MZ%(MM,1) = MZ%(MM,1) + MM + IN
6810  GOTO 3390
6820  IF MM = 2 OR MM = 7 THEN 3350
6830  PRINT "YOU ARE BEING ATTACKED"
6840   PRINT "BY A ";M$(MM)
6850  IF RND (1) * 20 - SGN (PW(3)) - C(3) + MM + IO < 0 THEN PRINT " MISSED"
6860   GOTO 3330
6870  PRINT "HIT"
6880  C(0) = C(0) - INT ( RND (1) * MM + IN)
6890  IF PA = 1 THEN PRINT "-CR- TO CONT. ";
6900   INPUT Q$
6910  GOTO 3390
6920  IF RND (1) < .5 THEN 3300
6930  IF MM = 7 THEN PW(0) = INT (PW(0) / 2)
6940   PRINT "A GREMLIN STOLE SO ME FOOD"
6950   GOTO 3330
6960  ZZ = INT ( RND (1) * 6)
6970   IF PW(ZZ) < 1 THEN 3370
6980  PRINT "A THIEF STOLE A ";W$(ZZ)
6990  PW(ZZ) = PW(ZZ) - 1
7000   GOTO 3330
7010  NEXT
7020   RETURN
7030  REM ------------------ DIE ------------------
7040  POKE 33,40
7050   PRINT
7060   PRINT
7070   PRINT "    WE MOURN THE PASSING OF "
7080  IF LEN (PN$) > 22 THEN PN$ = ""
7090  IF PN$ = "" THEN PN$ = "THE PEASANT"
7100  PN$ = PN$ + " AND HIS COMPUTER"
7110  HTAB (20 - INT ( LEN (PN$) / 2))
7120   PRINT PN$
7130  PRINT " TO INVOKE A MIRACLE OF RESSURECTION"
7140  PRINT "       <HIT ESC KEY>";
7150  IF PEEK ( - 16384) = 155 THEN 100
7160  GOTO 3480
7170  REM ------------------ LORD BRITISH'S CASTLE------------------
7180  HOME
7190   TEXT
7200   HOME
7210  CALL 62450
7220  IF PN$ < > "" THEN 3620
7230  PRINT
7240   PRINT
7250   PRINT "   WELCOME PEASANT INTO THE HALLS OF"
7260   PRINT "THE MIGHTY LORD BRITISH. HEREIN THOU MAYCHOOSE TO DARE BATTLE WITH THE EVIL"
7270   PRINT "CREATURES OF THE DEPTHS, FOR GREAT"
7280   PRINT "REWARD !"
7290  PRINT
7300   PRINT "WHAT IS THY NAME PEASANT ";
7310   INPUT PN$
7320  PRINT "DOEST THOU WISH FOR GRAND ADVENTURE ? ";
7330   GET Q$
7340   IF Q$ < > "Y" THEN PRINT
7350   PRINT "THEN LEAVE AND BEGONE!"
7360  PN$ = ""
7370   PRINT
7380   PRINT "     PRESS -SPACE- TO CONT.";
7390   GET Q$
7400   GOTO 2090
7410  PRINT
7420  PRINT
7430   PRINT "GOOD! THOU SHALT TRY TO BECOME A "
7440   PRINT "KNIGHT!! !"
7450   PRINT
7460   PRINT "THY FIRST TASK IS TO GO INTO THE"
7470   PRINT "DUNGEONS AND TO RETURN ONLY AFTER"
7480   PRINT "KILLING A(N) ";
7490  TASK = INT (C(4 ) / 3)
7500   PRINT M$(TASK)
7510  PRINT
7520   PRINT "   GO NOW UPON THIS QUEST, AND MAY"
7530   PRINT "LADY LUCK BE FAIR UNTO YOU....."
7540   PRINT ".....ALSO I, BRITISH, HAVE INCREASED"
7550   PRINT "EACH OF THY ATTRIBUTES BY ONE!"
7560  PRINT
7570   PRINT "     PRESS -SPACE- TO CONT.";
7580   GET Q$
7590   FOR X = 0 TO 5
7600  C(X) = C(X) + 1
7610   NEXT
7620   HOME
7630   GOTO 2090
7640  REM ------------------ RETURN TO CASTLE ------------------
7650  IF TASK > 0 THEN PRINT
7660   PRINT
7670   PRINT PN$;" WHY HAST THOU RETURNED?"
7680   PRINT "THOU MUST KILL A(N) ";M$(TASK)
7690   PRINT "GO NOW AND COMPLETE THY QUEST!"
7700   PRINT
7710   PRINT "     PRESS -SPACE- TO CONT.";
7720   GET Q$
7730   HOME
7740   GOTO 2090
7750  PRINT
7760   PRINT
7770   PRINT
7780   PRINT "AAHH!!.....";PN$
7790   PRINT
7800   PRINT "THOU HAST ACOMPLISHED THY QUEST!"
7810   IF ABS (TASK) = 10 THEN 3670
7820  PRINT "UNFORTUNATELY, THIS IS NOT ENOUGH TO"
7830   PRINT "BECOME A KNIGHT."
7840  TASK = ABS (TASK) + 1
7850   PRINT
7860   PRINT "NOW THOU MUST KILL A(N) ";M$(TASK)
7870  GOTO 3590
7880  REM ------------------ WIN ------------------
7890  TEXT
7900   HOME
7910   PRINT
7920   PRINT
7930   PRINT
7940  PN$ = "LORD " + PN$
7950   PRINT "   ";PN$;","
7960  PRINT "    THOU HAST PROVED THYSELF WORTHY"
7970   PRINT "OF KNIGHTHO OD, CONTINUE PLAY IF THOU"
7980   PRINT "DOTH WISH, BUT THOU HAST ACOMPLISHED"
7990   PRINT "THE MAIN OBJECTIVE OF THIS GAME..."
8000  IF LV = 10 THEN 3720
8010  PRINT
8020   PRINT "  NOW MAYBE THOU ART FOOLHEARTY"
8030   PRINT "ENOUGH TO TRY DIFFICULTY LEVEL ";LV + 1
8040  GOTO 3600
8050  PRINT
8060   PRINT "...CALL CALIFORNIA PACIFIC COMPUTER"
8070   PRINT "AT (415)-569-9126 TO REPORT THIS"
8080   PRINT "AMAZING FEAT!"
8090  GOTO 3600
8100  REM ------------------  CHARACTER CREATE  ------------------
8110  TEXT
8120   HOME
8130   VTAB (5)
8140   INPUT "TYPE THY LUCKY NUMBER.....";Q$
8150  LN = VAL (Q$)
8160  VTAB (7)
8170   INPUT "LEVEL OF PLAY (1-10)......";Q$
8180  LV = INT ( VAL ( Q$))
8190  IF LV < 1 OR LV > 10 THEN 3760
8200  ZZ = RND (-ABS(LN))
8210  DATA  "HIT POINTS.....","STRENGTH.......","DEXTERITY......","STA MINA........","WISDOM.........","GOLD..........."
8220  DIM PW(5)
8230  DIM C$(5)
8240   FOR X = 0 TO 5
8250   READ C$(X)
8260   NEXT
8270  DIM C(5)
8280  DIM M$(10),ML%(10,1),MZ%(10,1)
8290  DATA    "SKELETON","THIEF","GIANT RAT","ORC","VIPER","CARRION CRAWLER","GREMLIN","MIMIC","DAEMON","BALROG"
8300  FOR X = 1 TO 10
8310   READ M$(X)
8320   NEXT
8330  FOR X = 0 TO 5
8340  C(X) = INT ( SQR ( RND (1)) * 21 + 4)
8350   NEXT X
8360  HOME
8370   VTAB (8)
8380   FOR X = 0 TO 5
8390   PRINT C$(X),C(X)
8400   NEXT
8410   PRINT
8420   PRINT "SHALT THOU PLAY WITH THESE QUALITIES?"
8430   HTAB (20)
8440   GET Q$
8450   IF Q$ < > "Y" THEN 3860
8460  VTAB (15)
8470   PRINT
8480   PRINT "AND SHALT THOU BE A FIGHTER OR A MAGE?"
8490   HTAB (20)
8500   GET PT$
8510  IF PT$ = "M" OR PT$ = "F" THEN 3930
8520  GOTO 3880
8530  REM ------------------  END CHARACTER CREATE  ------------------
8540  REM ------------------  BEGIN INITIALIZE ITEMS  ------------------
8550  DIM W$(5)
8560   DATA  "FOOD","RAPIER","AXE","SHIELD","BOW AND ARROWS ","MAGIC AMULET"
8570   FOR X = 0 TO 5
8580   READ W$(X)
8590   NEXT
8600  GOSUB 3960
8610   GOSUB 4060
8620   RETURN
8630  REM ------------------  END INITIALIZE ITEMS  ------------------
8640  TEXT
8650   HOME
8660   PRINT
8670   PRINT
8680   PRINT "   STAT'S       WEAPONS"
8690   PRINT
8700   FOR X = 0 TO 5
8710   PRINT C$(X);C(X); TAB( 24);"0-";W$(X)
8720   NEXT
8730   POKE 34,12
8740   HOME
8750   POKE 35,15
8760  VTAB (11)
8770   HTAB (18)
8780   PRINT "Q-QUIT"
8790  IF PW(0) > 0 THEN CALL 62450
8800  FOR Z = 0 TO 5
8810   VTAB (5 + Z)
8820   HTAB (25 - LEN ( STR$ (PW(Z))))
8830   PRINT PW(Z);
8840   NEXT
8850  VTAB (17)
8860   HTAB (5)
8870   PRINT "PRICE";
8880   HTAB (15)
8890   PRINT "DAMAGE";
8900   HTAB (25)
8910   PRINT "ITEM"
8920  FOR X = 0 TO 5
8930   VTAB (19 + X)
8940   HTAB (25)
8950   PRINT W$(X)
8960   NEXT
8970  VTAB (19)
8980   HTAB (5)
8990   PRINT "1 FOR 10"
9000   HTAB (15)
9010   PRINT "N/A"
9020   VTAB (20)
9030   HTAB (5)
9040   PRINT "8"
9050   HTAB (15)
9060   PRINT "1-10"
9070   VTAB (21)
9080   HTAB (5)
9090   PRINT "5"
9100   HTAB (15)
9110   PRINT "1-5"
9120  VTAB (22)
9130   HTAB (5)
9140   PRINT "6"
9150   HTAB (15)
9160   PRINT "1"
9170   VTAB (23)
9180   HTAB (5)
9190   PRINT "3"
9200   HTAB (15)
9210   PRINT "1-4"
9220   VTAB (24)
9230   HTAB (5)
9240   PRINT " 15"
9250   HTAB (15)
9260   PRINT "?????"
9270   HOME
9280  RETURN
9290  REM ------------------  BEGIN ADVENTURE SHOP  ------------------
9300  HOME
9310   PRINT "WELCOME TO THE ADVENTURE SHOP"
9320  PRINT "WHICH ITEM SHALT THOU BUY ";
9330   GET Q$
9340   IF Q$ = "Q" THEN PRINT
9350   PRINT "BYE"
9360   FOR Z = 1 TO 1000
9370   NEXT
9380   TEXT
9390   HOME
9400   RETURN
9410  Z = - 1
9420  IF Q$ = "F" THEN PRINT "FOOD"
9430  Z = 0
9440  P = 1
9450  IF Q$ = "R" THEN PRINT "RAPIER"
9460  Z = 1
9470  P = 8
9480  IF Q$ = "A" THEN PRINT "AXE"
9490  Z = 2
9500  P = 5
9510  IF Q$ = "S" THEN PRINT "SHIELD"
9520  Z = 3
9530  P = 6
9540  IF Q$ = "B" THEN PRINT "BOW"
9550  Z = 4
9560  P = 3
9570        IF Q$ = "M" THEN PRINT "AMULET"
9580  Z = 5
9590  P = 15
9600  IF Z = - 1 THEN PRINT Q$
9610   PRINT "I'M SORRY WE DON'T HAVE THAT."
9620   GOTO 4070
9630  IF Q$ = "R" AND PT$ = "M" THEN PRINT "I'M SORRY MAGES"
9640   PRINT "CAN'T USE THAT!"
9650   GOTO 4070
9660  IF Q$ = "B" AND PT$ = "M" THEN PRINT "I'M SORRY MAGES"
9670   PRINT "CAN'T USE THAT!"
9680   GOTO 4070
9690  IF C(5) - P < 0 THEN PRINT "M'LORD THOU CAN NOT AFFORD THAT ITEM."
9700   GOTO 4070
9710    C(5) = C(5) - P
9720    VTAB (10)
9730    HTAB (16)
9740    PRINT C(5);" "
9750    VTAB (5 + Z)
9760    HTAB (25 - LEN ( STR$ (PW(Z))))
9770    PRINT PW(Z);
9780    HTAB (1)
9790    VTAB (14)
9800    PRINT
9810   GOTO 4070
9820 REM ------------------  END ADVENTURE SHOP  ------------------
991
