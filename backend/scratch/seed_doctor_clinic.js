const prisma = require('../src/config/prisma');

async function seed() {
  console.log('--- Starting Seed Doctor Clinic Data ---');

  // 1. Phân công ca trực cho BS. Nguyễn Hoàng Nam (mabs: 1, manv: 1) ngày hôm nay
  const today = new Date();
  const todayDateOnly = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));

  let shift = await prisma.calamviec.findFirst({
    where: { ngay: todayDateOnly }
  });

  if (!shift) {
    shift = await prisma.calamviec.create({
      data: {
        ngay: todayDateOnly,
        giobatdau: new Date('1970-01-01T07:30:00.000Z'),
        gioketthuc: new Date('1970-01-01T17:00:00.000Z'),
        maphong: 1
      }
    });
    console.log('Created shift for today:', shift.maca);
  }

  const assigned = await prisma.phanconglamviec.findFirst({
    where: { manv: 1, maca: shift.maca }
  });
  if (!assigned) {
    await prisma.phanconglamviec.create({
      data: { manv: 1, maca: shift.maca }
    });
    console.log('Assigned BS. Nguyễn Hoàng Nam to shift today');
  }

  // 2. Lấy danh sách bệnh nhân để gán lịch hẹn hôm nay
  const allPatients = await prisma.benhnhan.findMany({
    orderBy: { mabn: 'asc' }
  });
  
  const appointmentSlots = [
    { time: '1970-01-01T08:00:00.000Z', reason: 'Đau tức ngực nhẹ, thỉnh thoảng hồi hộp đánh trống ngực', status: 'DaXacNhan' },
    { time: '1970-01-01T08:30:00.000Z', reason: 'Mắt đỏ, cộm xốn và chảy nước mắt khi nhìn màn hình', status: 'DaXacNhan' },
    { time: '1970-01-01T09:15:00.000Z', reason: 'Tái khám kiểm tra thị lực sau điều trị viêm giác mạc', status: 'ChoXacNhan' },
    { time: '1970-01-01T10:00:00.000Z', reason: 'Khám mắt định kỳ, đo độ cận viễn thị', status: 'DaXacNhan' },
    { time: '1970-01-01T14:30:00.000Z', reason: 'Đau đầu âm ỉ kèm hoa mắt chóng mặt', status: 'ChoXacNhan' }
  ];

  for (let i = 0; i < Math.min(allPatients.length, appointmentSlots.length); i++) {
    const pt = allPatients[i];
    const slot = appointmentSlots[i];

    const existApt = await prisma.lichhen.findFirst({
      where: {
        mabn: pt.mabn,
        mabs: 1,
        ngayhen: todayDateOnly
      }
    });

    if (!existApt) {
      const newApt = await prisma.lichhen.create({
        data: {
          mabn: pt.mabn,
          mabs: 1,
          ngayhen: todayDateOnly,
          giohen: new Date(slot.time),
          trangthai: slot.status,
          lydokham: slot.reason
        }
      });
      console.log(`Created today appointment #${newApt.malh} for patient ${pt.hoten} at ${slot.time.split('T')[1].substring(0, 5)} (${slot.status})`);
    } else {
      console.log(`Appointment already exists for patient ${pt.hoten} on today`);
    }
  }

  console.log('--- Seed Completed Successfully ---');
}

seed()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
