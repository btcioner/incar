#!/bin/sh
mysql $1 $2 $3 $4 $5 $6 $7 $8 $9 < 20140312A_SYS.sql
mysql $1 $2 $3 $4 $5 $6 $7 $8 $9 < 20140313A_OBD.sql
mysql $1 $2 $3 $4 $5 $6 $7 $8 $9 < 20140506A_Business.sql
mysql $1 $2 $3 $4 $5 $6 $7 $8 $9 < 20140506B_Staff.sql
mysql $1 $2 $3 $4 $5 $6 $7 $8 $9 < 20140506C_Promotion.sql
mysql $1 $2 $3 $4 $5 $6 $7 $8 $9 < 20140506D_Content.sql
mysql $1 $2 $3 $4 $5 $6 $7 $8 $9 < 20140506E_Work.sql
mysql $1 $2 $3 $4 $5 $6 $7 $8 $9 < 20140527A_Activity.sql
mysql $1 $2 $3 $4 $5 $6 $7 $8 $9 < 20140528A_ActSaveGas.sql
