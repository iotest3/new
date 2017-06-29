from karl.bootstrap.data import DefaultInitialData

from pyramid.security import Allow
from pyramid.security import Authenticated

from karl.security.policy import ADMINISTRATOR_PERMS
from karl.security.policy import GUEST_PERMS
from karl.security.policy import MEMBER_PERMS
from karl.security.policy import MODERATOR_PERMS

class OSIData(DefaultInitialData):
    users_and_groups = [
        ('admin', 'Ad','Min','admin@example.com',
         ('group.KarlAdmin', 'group.KarlUserAdmin', 'group.KarlStaff')),
        ('nyc', 'En', 'Wycee', 'nyc@example.com',
         ('group.KarlStaff',)),
        ('affiliate', 'Aff', 'Illiate', 'affiliate@example.com',
         ('group.KarlAffiliate',)),
        ('staff1','Staff','One','staff1@example.com',
         ('group.KarlStaff',)),
        ('staff2','Staff','Two','staff2@example.com',
         ('group.KarlStaff',)),
        ('staff3','Staff','Three','staff3@example.com',
         ('group.KarlStaff',)),
        ('staff4','Staff','Four','staff4@example.com',
         ('group.KarlStaff',)),
        ('staff5','Staff','Five','staff5@example.com',
         ('group.KarlStaff',)),
        ('staff6','Staff','Six','staff6@example.com',
         ('group.KarlStaff',)),
        ('staff7','Staff','Seven','staff7@example.com',
         ('group.KarlStaff',)),
        ('staff8','Staff','Eight','staff8@example.com',
         ('group.KarlStaff',)),
        ('staff9','Staff','Nine','staff9@example.com',
         ('group.KarlStaff',)),
        ('staff10','Staff','Ten','staff10@example.com',
         ('group.KarlStaff',)),
        ('staff11','Staff','Eleven','staff11@example.com',
         ('group.KarlStaff',)),
        ('staff12','Staff','Twelve','staff12@example.com',
         ('group.KarlStaff',)),
        ('affiliate1','Affiliate','One','affiliate1@example.com',
         ('groups.KarlAffiliate',)),
        ('affiliate2','Affiliate','Two','affiliate2@example.com',
         ('groups.KarlAffiliate',)),
        ('affiliate3','Affiliate','Three','affiliate3@example.com',
         ('groups.KarlAffiliate',)),
        ('affiliate4','Affiliate','Four','affiliate4@example.com',
         ('groups.KarlAffiliate',)),
        ('affiliate5','Affiliate','Five','affiliate5@example.com',
         ('groups.KarlAffiliate',)),
        ('affiliate6','Affiliate','Six','affiliate6@example.com',
         ('groups.KarlAffiliate',)),
        ('affiliate7','Affiliate','Seven','affiliate7@example.com',
         ('groups.KarlAffiliate',)),
        ('affiliate8','Affiliate','Eight','affiliate8@example.com',
         ('groups.KarlAffiliate',)),
        ('affiliate9','Affiliate','Nine','affiliate9@example.com',
         ('groups.KarlAffiliate',)),
        ('affiliate10','Affiliate','Ten','affiliate10@example.com',
         ('groups.KarlAffiliate',)),
        ('affiliate11','Affiliate','Eleven','affiliate11@example.com',
         ('groups.KarlAffiliate',)),
        ('affiliate12','Affiliate','Twelve','affiliate12@example.com',
         ('groups.KarlAffiliate',))
    ]
