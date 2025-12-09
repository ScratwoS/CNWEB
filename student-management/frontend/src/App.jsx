import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
import './App.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const api = axios.create({ baseURL: `${API_BASE}/api` });

function App() {
  const [students, setStudents] = useState([]);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [stuClass, setStuClass] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortAsc, setSortAsc] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [listOpen, setListOpen] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/students');
      setStudents(res.data);
    } catch (err) {
      setError('Không tải được danh sách. Hãy kiểm tra server/backend.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setAge('');
    setStuClass('');
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    if (!name.trim() || !age || !stuClass.trim()) {
      setMessage('Vui lòng nhập đủ Họ tên, Tuổi, Lớp.');
      return;
    }
    const payload = { name: name.trim(), age: Number(age), class: stuClass.trim() };

    try {
      if (editingId) {
        const res = await api.put(`/students/${editingId}`, payload);
        setStudents((prev) => prev.map((s) => (s._id === editingId ? res.data : s)));
        setMessage('Đã cập nhật học sinh.');
      } else {
        const res = await api.post('/students', payload);
        setStudents((prev) => [...prev, res.data]);
        setMessage('Đã thêm học sinh mới.');
      }
      resetForm();
    } catch (err) {
      setMessage(err.response?.data?.error || 'Có lỗi xảy ra, thử lại.');
    }
  };

  const handleEdit = (stu) => {
    setEditingId(stu._id);
    setName(stu.name);
    setAge(stu.age.toString());
    setStuClass(stu.class);
    setMessage('Đang chỉnh sửa học sinh, cập nhật và bấm Lưu.');
  };

  const handleCancelEdit = () => {
    resetForm();
    setMessage('');
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Bạn có chắc muốn xóa học sinh này?');
    if (!confirmDelete) return;
    try {
      await api.delete(`/students/${id}`);
      setStudents((prev) => prev.filter((s) => s._id !== id));
      setMessage('Đã xóa học sinh.');
    } catch (err) {
      setMessage('Lỗi khi xóa, hãy thử lại.');
    }
  };

  const filteredStudents = useMemo(
    () =>
      students.filter((s) =>
        s.name.toLowerCase().includes(searchTerm.trim().toLowerCase())
      ),
    [students, searchTerm]
  );

  // Lấy khóa sắp xếp theo tên riêng (tên cuối trong họ tên tiếng Việt)
  const getSortKey = (fullName) => {
    const cleaned = (fullName || '').trim().toLowerCase();
    if (!cleaned) return '';
    const parts = cleaned.split(/\s+/);
    const givenName = parts.pop(); // tên riêng
    return `${givenName} ${parts.join(' ')}`.trim();
  };

  const sortedStudents = useMemo(() => {
    const copied = [...filteredStudents];
    copied.sort((a, b) => {
      const keyA = getSortKey(a.name);
      const keyB = getSortKey(b.name);
      const result = keyA.localeCompare(keyB, 'vi', { sensitivity: 'base' });
      if (result !== 0) return sortAsc ? result : -result;
      // fallback khi trùng khóa: so sánh toàn bộ họ tên
      const fallback = a.name.localeCompare(b.name, 'vi', { sensitivity: 'base' });
      return sortAsc ? fallback : -fallback;
    });
    return copied;
  }, [filteredStudents, sortAsc]);

  return (
    <div className="app">
      <header className="hero">
        <div>
          <p className="eyebrow">MERN Stack • Express • MongoDB • React</p>
          <h1>Ứng dụng Quản lý Học sinh</h1>
          <p className="sub">
            Thêm - sửa - xóa - tìm kiếm - sắp xếp học sinh, kết nối qua REST API.
          </p>
        </div>
        <div className="hero-actions">
          <button className="outline" onClick={fetchStudents}>
            Tải lại danh sách
          </button>
          <button
            onClick={() => setSortAsc((prev) => !prev)}
            aria-label="Sắp xếp theo tên"
          >
            Sắp xếp theo tên: {sortAsc ? 'A → Z' : 'Z → A'}
          </button>
        </div>
      </header>

      <section className="grid">
        <div className="card form-card">
          <div className="card-head">
            <div>
              <p className="eyebrow">{editingId ? 'Chỉnh sửa' : 'Thêm mới'}</p>
              <h2>{editingId ? 'Cập nhật học sinh' : 'Thêm học sinh mới'}</h2>
              <p className="muted">
                Nhập Họ tên, Tuổi, Lớp. Dữ liệu gửi trực tiếp tới API Express.
              </p>
            </div>
            {editingId && (
              <button className="ghost" onClick={handleCancelEdit}>
                Hủy chỉnh sửa
              </button>
            )}
          </div>

          <form className="form" onSubmit={handleSubmit}>
            <label>
              Họ tên
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: Nguyễn Văn An"
                required
              />
            </label>
            <label>
              Tuổi
              <input
                type="number"
                min="1"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="VD: 16"
                required
              />
            </label>
            <label>
              Lớp
              <input
                type="text"
                value={stuClass}
                onChange={(e) => setStuClass(e.target.value)}
                placeholder="VD: 10A1"
                required
              />
            </label>

            <div className="form-actions">
              <button type="submit">
                {editingId ? 'Lưu thay đổi' : 'Thêm học sinh'}
              </button>
              {editingId && (
                <button type="button" className="outline" onClick={handleCancelEdit}>
                  Thêm mới
                </button>
              )}
            </div>
          </form>
          {message && <p className="info">{message}</p>}
        </div>

        <div className="card stats-card">
          <h3>Tóm tắt nhanh</h3>
          <div className="stats">
            <div className="stat">
              <p className="label">Tổng số học sinh</p>
              <p className="value">{students.length}</p>
            </div>
            <div className="stat">
              <p className="label">Đang lọc theo</p>
              <p className="value">{searchTerm ? `"${searchTerm}"` : 'Không'}</p>
            </div>
            <div className="stat">
              <p className="label">Thứ tự</p>
              <p className="value">{sortAsc ? 'A → Z' : 'Z → A'}</p>
            </div>
          </div>
          <p className="muted">
            Bạn có thể thay đổi trạng thái sắp xếp, tìm kiếm theo tên hoặc nhấn Tải
            lại để gọi lại API.
          </p>
        </div>
      </section>

      <section className="card list-card">
        <button className="collapse-toggle" onClick={() => setListOpen((p) => !p)}>
          <span className={`arrow ${listOpen ? 'open' : ''}`} aria-hidden>➤</span>
          <div className="title-block">
            <p className="eyebrow">Danh sách</p>
            <h2>Danh sách học sinh</h2>
          </div>
          <div className="search">
            <input
              type="text"
              placeholder="Tìm kiếm theo tên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </button>

        {listOpen && (
          <>
            {loading && <p className="muted">Đang tải dữ liệu...</p>}
            {error && <p className="error">{error}</p>}

            {!loading && !sortedStudents.length && (
              <p className="muted">Chưa có học sinh nào.</p>
            )}

            {!loading && sortedStudents.length > 0 && (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Họ tên</th>
                      <th>Tuổi</th>
                      <th>Lớp</th>
                      <th>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedStudents.map((stu) => (
                      <tr key={stu._id}>
                        <td>{stu.name}</td>
                        <td>{stu.age}</td>
                        <td>{stu.class}</td>
                        <td className="actions">
                          <button className="ghost" onClick={() => handleEdit(stu)}>
                            Sửa
                          </button>
                          <button className="danger" onClick={() => handleDelete(stu._id)}>
                            Xóa
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}

export default App;
