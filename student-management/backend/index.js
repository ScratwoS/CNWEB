const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Student = require('./Student');

const app = express();
const PORT = process.env.PORT || 5000;
// Mặc định trỏ tới DB "cn" trên cụm Atlas, có thể override bằng biến môi trường MONGO_URI
const MONGO_URI =
  process.env.MONGO_URI ||
  'mongodb+srv://CNWEB:scratwos2004@cluster0.t36r4k6.mongodb.net/cn?retryWrites=true&w=majority&appName=Cluster0';

app.use(cors());
app.use(express.json());

mongoose
  // dbName để chắc chắn dùng đúng database "cn" kể cả khi URI thiếu path
  .connect(MONGO_URI, { dbName: 'cn' })
  .then(async () => {
    console.log('Đã kết nối MongoDB thành công, DB:', mongoose.connection.name);
    try {
      const count = await Student.countDocuments();
      console.log(`Collection "${Student.collection.name}" hiện có ${count} document(s).`);
    } catch (err) {
      console.error('Không đếm được document:', err.message);
    }
  })
  .catch((err) => console.error('Lỗi kết nối MongoDB:', err));

app.get('/', (req, res) => {
  res.json({ message: 'Student Management API is running' });
});

// Lấy danh sách học sinh (có hỗ trợ lọc theo tên qua query ?name=)
app.get('/api/students', async (req, res) => {
  try {
    const { name } = req.query;
    const query = name
      ? { name: { $regex: name, $options: 'i' } }
      : {};
    const students = await Student.find(query).sort({ createdAt: -1 });
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Lấy chi tiết 1 học sinh
app.get('/api/students/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ error: 'Student not found' });
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Thêm mới học sinh
app.post('/api/students', async (req, res) => {
  try {
    const newStudent = await Student.create(req.body);
    res.status(201).json(newStudent);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Cập nhật học sinh
app.put('/api/students/:id', async (req, res) => {
  try {
    const updatedStu = await Student.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!updatedStu) return res.status(404).json({ error: 'Student not found' });
    res.json(updatedStu);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Xóa học sinh
app.delete('/api/students/:id', async (req, res) => {
  try {
    const deleted = await Student.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Student not found' });
    res.json({ message: 'Đã xóa học sinh', id: deleted._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
