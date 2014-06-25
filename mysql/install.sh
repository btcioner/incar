#!/bin/sh
mysql -u root -p -D incar < 20140312A_SYS.sql
mysql -u root -p -D incar < 20140313A_OBD.sql
mysql -u root -p -D incar < 20140506A_Business.sql
mysql -u root -p -D incar < 20140506B_Staff.sql
mysql -u root -p -D incar < 20140506C_Promotion.sql
mysql -u root -p -D incar < 20140506D_Content.sql
mysql -u root -p -D incar < 20140506E_Work.sql
mysql -u root -p -D incar < 20140527A_Activity.sql
mysql -u root -p -D incar < 20140528A_ActSaveGas.sql
