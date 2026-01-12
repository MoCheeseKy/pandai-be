import db from '../../config/firebase.config';
import { ServiceResponse } from '../../common/models/serviceResponse';
import { StatusCodes } from 'http-status-codes';

class AcademicService {
  private subjectsRef = db.collection('subjects');
  private classesRef = db.collection('classes');
  private coursesRef = db.collection('courses');
  private usersRef = db.collection('users');

  // ==========================================
  // SUBJECTS (MATA PELAJARAN)
  // ==========================================
  async createSubject(data: any) {
    const docRef = await this.subjectsRef.add({
      ...data,
      createdAt: new Date(),
    });
    return ServiceResponse.success(
      'Mata pelajaran dibuat',
      { id: docRef.id, ...data },
      StatusCodes.CREATED
    );
  }

  async getAllSubjects() {
    const snapshot = await this.subjectsRef.get();
    const subjects = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return ServiceResponse.success('List mata pelajaran', subjects);
  }

  // ==========================================
  // CLASSES (KELAS)
  // ==========================================
  async createClass(data: any) {
    const docRef = await this.classesRef.add({
      ...data,
      createdAt: new Date(),
    });
    return ServiceResponse.success(
      'Kelas berhasil dibuat',
      { id: docRef.id, ...data },
      StatusCodes.CREATED
    );
  }

  async getAllClasses() {
    const snapshot = await this.classesRef.orderBy('gradeLevel').get();
    const classes = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return ServiceResponse.success('List kelas', classes);
  }

  // ==========================================
  // COURSES (JADWAL PELAJARAN)
  // ==========================================

  // 1. Buat Jadwal Baru (Biasanya oleh Waka/Admin)
  async createCourse(data: any) {
    // Di sini bisa ditambahkan validasi apakah IDs valid, tapi skip dulu untuk MVP
    const docRef = await this.coursesRef.add({
      ...data,
      createdAt: new Date(),
    });

    return ServiceResponse.success(
      'Jadwal pelajaran berhasil dibuat',
      { id: docRef.id, ...data },
      StatusCodes.CREATED
    );
  }

  // 2. Get Courses untuk GURU (Jadwal Mengajar)
  async getCoursesByTeacher(teacherId: string) {
    const snapshot = await this.coursesRef
      .where('teacherId', '==', teacherId)
      .get();

    if (snapshot.empty) {
      return ServiceResponse.success('Jadwal mengajar kosong', []);
    }

    // Ambil detail Kelas dan Mapel agar frontend tidak cuma dapat ID
    const courses = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const data = doc.data();

        const classDoc = await this.classesRef.doc(data.classId).get();
        const className = classDoc.exists
          ? classDoc.data()?.name
          : 'Unknown Class';

        const subjectDoc = await this.subjectsRef.doc(data.subjectId).get();
        const subjectName = subjectDoc.exists
          ? subjectDoc.data()?.name
          : 'Unknown Subject';

        return {
          id: doc.id,
          ...data,
          className,
          subjectName,
        };
      })
    );

    return ServiceResponse.success('Jadwal mengajar guru', courses);
  }

  // 3. Get Courses untuk MURID (Jadwal Pelajaran di Kelasnya)
  async getCoursesByClass(classId: string) {
    const snapshot = await this.coursesRef
      .where('classId', '==', classId)
      .get();

    if (snapshot.empty) {
      return ServiceResponse.success('Jadwal pelajaran kelas ini kosong', []);
    }

    // Ambil detail Guru dan Mapel
    const courses = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const data = doc.data();

        const subjectDoc = await this.subjectsRef.doc(data.subjectId).get();
        const subjectName = subjectDoc.exists
          ? subjectDoc.data()?.name
          : 'Unknown Subject';

        const teacherDoc = await this.usersRef.doc(data.teacherId).get();
        const teacherName = teacherDoc.exists
          ? teacherDoc.data()?.fullname
          : 'Unknown Teacher';

        return {
          id: doc.id,
          ...data,
          subjectName,
          teacherName,
        };
      })
    );

    return ServiceResponse.success('Jadwal pelajaran kelas', courses);
  }
}

export default new AcademicService();
