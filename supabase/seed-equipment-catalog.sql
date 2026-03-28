-- Inventory based on document:
-- "งานส่งเสริมและเทคโนโลยีปฏิบัติการ.pdf"
-- pages 4-6 (ทะเบียนเครื่องพ่นเคมี / เครื่องพ่นหมอกควัน / ULV)

DELETE FROM public.equipment
WHERE serial IN (
    'FOG-SN50-001',
    'FOG-SN50-002',
    'FOG-TF35-003',
    'FOG-TF95-004',
    'ULV-C100-001',
    'ULV-C150-002',
    'ULV-H200-003',
    'BPK-20L-001',
    'BPK-20L-002',
    'BPK-20L-003',
    'BPK-25L-004'
);

INSERT INTO public.equipment (name, type, serial, status, image_url)
SELECT *
FROM (
    VALUES
        ('เครื่องพ่นสารเคมีชนิดอัดลมด้วยมือ ยี่ห้อ HUDSON X-PERT SPRAYER', 'HUDSON X-PERT SPRAYER', '0334 0418 0044', 'available', NULL),
        ('เครื่องพ่นสารเคมีชนิดอัดลมด้วยมือ ยี่ห้อ HUDSON X-PERT SPRAYER', 'HUDSON X-PERT SPRAYER', '0334 0418 0045', 'available', NULL),
        ('เครื่องพ่นสารเคมีชนิดอัดลมด้วยมือ ยี่ห้อ HUDSON X-PERT SPRAYER', 'HUDSON X-PERT SPRAYER', '0334 0418 0046', 'available', NULL),
        ('เครื่องพ่นสารเคมีชนิดอัดลมด้วยมือ ยี่ห้อ HUDSON X-PERT SPRAYER', 'HUDSON X-PERT SPRAYER', '0334 0418 0047', 'available', NULL),
        ('เครื่องพ่นสารเคมีชนิดอัดลมด้วยมือ ยี่ห้อ HUDSON X-PERT SPRAYER', 'HUDSON X-PERT SPRAYER', '0334 0418 0048', 'available', NULL),
        ('เครื่องพ่นสารเคมีชนิดอัดลมด้วยมือ ยี่ห้อ HUDSON X-PERT SPRAYER', 'HUDSON X-PERT SPRAYER', '0334 0418 0049', 'available', NULL),
        ('เครื่องพ่นสารเคมีชนิดอัดลมด้วยมือ ยี่ห้อ HUDSON X-PERT SPRAYER', 'HUDSON X-PERT SPRAYER', '0334 0418 0050', 'available', NULL),
        ('เครื่องพ่นสารเคมีชนิดอัดลมด้วยมือ ยี่ห้อ HUDSON X-PERT SPRAYER', 'HUDSON X-PERT SPRAYER', '0334 0418 0051', 'available', NULL),
        ('เครื่องพ่นสารเคมีชนิดอัดลมด้วยมือ ยี่ห้อ HUDSON X-PERT SPRAYER', 'HUDSON X-PERT SPRAYER', '0334 0418 0052', 'available', NULL),
        ('เครื่องพ่นสารเคมีชนิดอัดลมด้วยมือ ยี่ห้อ HUDSON X-PERT SPRAYER', 'HUDSON X-PERT SPRAYER', '0334 0418 0053', 'available', NULL),
        ('เครื่องพ่นสารเคมีชนิดอัดลมด้วยมือ ยี่ห้อ HUDSON X-PERT SPRAYER', 'HUDSON X-PERT SPRAYER', '0334 0418 0061', 'available', NULL),
        ('เครื่องพ่นสารเคมีชนิดอัดลมด้วยมือ ยี่ห้อ HUDSON X-PERT SPRAYER', 'HUDSON X-PERT SPRAYER', '0334 0418 0062', 'available', NULL),
        ('เครื่องพ่นสารเคมีชนิดอัดลมด้วยมือ ยี่ห้อ HUDSON X-PERT SPRAYER', 'HUDSON X-PERT SPRAYER', '0334 0418 0063', 'available', NULL),
        ('เครื่องพ่นสารเคมีชนิดอัดลมด้วยมือ ยี่ห้อ HUDSON X-PERT SPRAYER', 'HUDSON X-PERT SPRAYER', '0334 0418 0087', 'available', NULL),
        ('เครื่องพ่นสารเคมีชนิดอัดลมด้วยมือ ยี่ห้อ HUDSON X-PERT SPRAYER', 'HUDSON X-PERT SPRAYER', '0334 0418 0088', 'available', NULL),
        ('เครื่องพ่นสารเคมีชนิดอัดลมด้วยมือ ยี่ห้อ HUDSON X-PERT SPRAYER', 'HUDSON X-PERT SPRAYER', '0334 0418 0089', 'available', NULL),
        ('เครื่องพ่นสารเคมีชนิดอัดลมด้วยมือ ยี่ห้อ HUDSON X-PERT SPRAYER', 'HUDSON X-PERT SPRAYER', '0334 0418 0090', 'available', NULL),
        ('เครื่องพ่นสารเคมีชนิดอัดลมด้วยมือ ยี่ห้อ HUDSON X-PERT SPRAYER', 'HUDSON X-PERT SPRAYER', '0334 0418 0091', 'available', NULL),
        ('เครื่องพ่นสารเคมีชนิดอัดลมด้วยมือ ยี่ห้อ HUDSON X-PERT SPRAYER', 'HUDSON X-PERT SPRAYER', '0334 0418 0092', 'available', NULL),
        ('เครื่องพ่นสารเคมีชนิดอัดลมด้วยมือ ยี่ห้อ HUDSON X-PERT SPRAYER', 'HUDSON X-PERT SPRAYER', '0334 0418 0093', 'available', NULL),
        ('เครื่องพ่นสารเคมีชนิดอัดลมด้วยมือ ยี่ห้อ HUDSON X-PERT SPRAYER', 'HUDSON X-PERT SPRAYER', '0334 0461 01160 0106', 'available', NULL),
        ('เครื่องพ่นสารเคมีชนิดอัดลมด้วยมือ ยี่ห้อ HUDSON X-PERT SPRAYER', 'HUDSON X-PERT SPRAYER', '0334 0461 01160 0107', 'available', NULL),
        ('เครื่องพ่นสารเคมีชนิดอัดลมด้วยมือ ยี่ห้อ HUDSON X-PERT SPRAYER', 'HUDSON X-PERT SPRAYER', '0334 0461 01160 0108', 'available', NULL),
        ('เครื่องพ่นเคมีชนิดอัดลม IK VECTOR CONTROL SUPER', 'IK VECTOR CONTROL SUPER', 'สคร.0334 0429 0863 0124', 'available', NULL),
        ('เครื่องพ่นเคมีชนิดอัดลม IK VECTOR CONTROL SUPER', 'IK VECTOR CONTROL SUPER', 'สคร.0334 0429 0863 0125', 'available', NULL),
        ('เครื่องพ่นเคมีชนิดอัดลม IK VECTOR CONTROL SUPER', 'IK VECTOR CONTROL SUPER', 'สคร.0334 0429 0863 0126', 'available', NULL),
        ('เครื่องพ่นเคมีชนิดอัดลม IK VECTOR CONTROL SUPER', 'IK VECTOR CONTROL SUPER', 'สคร.0334 0429 0863 0127', 'available', NULL),
        ('เครื่องพ่นเคมีชนิดอัดลม IK VECTOR CONTROL SUPER', 'IK VECTOR CONTROL SUPER', 'สคร.0334 0429 0465 0140', 'available', NULL),
        ('เครื่องพ่นเคมีชนิดอัดลม IK VECTOR CONTROL SUPER', 'IK VECTOR CONTROL SUPER', 'สคร.0334 0429 0465 0141', 'available', NULL),
        ('เครื่องพ่นเคมีชนิดอัดลม IK VECTOR CONTROL SUPER', 'IK VECTOR CONTROL SUPER', 'สคร.0334 0429 0465 0142', 'available', NULL),
        ('เครื่องพ่นเคมีชนิดอัดลม IK VECTOR CONTROL SUPER', 'IK VECTOR CONTROL SUPER', 'สคร.0334 0429 0465 0143', 'available', NULL),
        ('เครื่องพ่นเคมีชนิดอัดลม IK VECTOR CONTROL SUPER', 'IK VECTOR CONTROL SUPER', 'สคร.0334 0429 0465 0144', 'available', NULL),
        ('เครื่องพ่นชนิดอัดลม ยี่ห้อ Micron รุ่น CS-10', 'Micron CS-10', '51 6640 007 00005 (67)', 'available', NULL),
        ('เครื่องพ่นหมอกควัน ยี่ห้อ SWING FOG SN 11 P เลขเครื่อง 8551', 'SWING FOG SN 11 P', '0332 048 0001 / 8551', 'available', NULL),
        ('เครื่องพ่นหมอกควัน ยี่ห้อ SWING FOG SN 50 เลขเครื่อง 8666', 'SWING FOG SN 50', '0332 048 0001 / 8666', 'available', NULL),
        ('เครื่องพ่นฝอยละเอียด ไอจีบ้า พอร์ที 123 ยูแอลวี เลขเครื่อง NR070542604', 'IGEBA Port 123 ULV', '0332 012.4 0010 / NR070542604', 'available', NULL),
        ('เครื่องพ่นฝอยละเอียด ไอจีบ้า พอร์ที 123 ยูแอลวี เลขเครื่อง NR070545004', 'IGEBA Port 123 ULV', '0332 012.4 0011 / NR070545004', 'available', NULL),
        ('เครื่องพ่นหมอกควัน SWING FOG SN50', 'SWING FOG SN 50', '0332 012.4 0012', 'available', NULL),
        ('เครื่องพ่นฝอยละอองแบบติดรถยนต์ ULV ยี่ห้อ อีเก้า 1800 E', 'ULV 1800 E', '0332 00418 00049', 'available', NULL),
        ('เครื่องพ่นละอองฝอย ยี่ห้อ twister xl by Dynafog เลขเครื่อง TL 060545', 'Twister XL by Dynafog', '0332 0418 0098 / TL 060545', 'available', NULL),
        ('เครื่องพ่นละอองฝอยยี่ห้อ Swingtec Serial No.154710', 'Swingtec', 'สคร.0332 0418 0105 / 154710', 'available', NULL),
        ('เครื่องพ่นละอองฝอยยี่ห้อ Swingtec Serial No.154714', 'Swingtec', 'สคร.0332 0418 0104 / 154714', 'available', NULL),
        ('เครื่องพ่นเคมีชนิดฝอยละออง (ULV) สะพายหลังยี่ห้อ FONTAN รุ่น PORTASTARs', 'FONTAN PORTASTARs', 'สคร.0332 0418 0121', 'available', NULL),
        ('เครื่องพ่นเคมีชนิดฝอยละออง (ULV) สะพายหลังยี่ห้อ FONTAN รุ่น PORTASTARs', 'FONTAN PORTASTARs', 'สคร.0332 0418 0122', 'available', NULL),
        ('เครื่องพ่นเคมีชนิดฝอยละออง (ULV) สะพายหลังยี่ห้อ FONTAN รุ่น PORTASTARs', 'FONTAN PORTASTARs', 'สคร.0332 0418 0126', 'available', NULL),
        ('เครื่องพ่นเคมีชนิดฝอยละออง (ULV) สะพายหลังยี่ห้อ FONTAN รุ่น PORTASTARs', 'FONTAN PORTASTARs', 'สคร.0332 0418 0127', 'available', NULL),
        ('เครื่องพ่นเคมีชนิดฝอยละออง (ULV) ยี่ห้อ Misuko รุ่น 3WF-3A', 'Misuko 3WF-3A', '0334 0461 1260', 'available', NULL),
        ('เครื่องพ่นเคมี ULV สะพายหลังยี่ห้อ Swingtac Serial No 164841', 'Swingtac ULV', '0332 0461 11600124 / 164841', 'available', NULL)
) AS seed(name, type, serial, status, image_url)
WHERE NOT EXISTS (
    SELECT 1
    FROM public.equipment existing
    WHERE existing.serial = seed.serial
);

