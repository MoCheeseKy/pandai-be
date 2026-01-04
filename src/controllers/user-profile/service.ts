import db from '../../config/firebase.config';
import { ServiceResponse } from '../../common/models/serviceResponse';
import { StatusCodes } from 'http-status-codes';

class UserProfileService {
  private profilesRef = db.collection('profiles');
  private usersRef = db.collection('users');

  // Update Profile Generic
  async updateProfile(userId: string, userRole: string, data: any) {
    // 1. Pastikan user ada
    const userDoc = await this.usersRef.doc(userId).get();
    if (!userDoc.exists) {
      return ServiceResponse.failure(
        'User tidak ditemukan',
        null,
        StatusCodes.NOT_FOUND
      );
    }

    // 2. Validasi Role (Security Check)
    // Mencegah murid mengupdate profile menggunakan endpoint guru
    const userData = userDoc.data();
    if (userData?.role !== userRole) {
      return ServiceResponse.failure(
        `Akun ini bukan role ${userRole}`,
        null,
        StatusCodes.FORBIDDEN
      );
    }

    // 3. Simpan ke collection 'profiles' dengan ID yang sama dengan User ID
    // Gunakan { merge: true } agar data tidak tertimpa total jika update parsial
    await this.profilesRef.doc(userId).set(
      {
        ...data,
        role: userRole,
        updatedAt: new Date(),
      },
      { merge: true }
    );

    return ServiceResponse.success('Profile berhasil diperbarui', data);
  }

  // Get Profile by Token (Me)
  async getMyProfile(userId: string) {
    const profileDoc = await this.profilesRef.doc(userId).get();
    const userDoc = await this.usersRef.doc(userId).get();

    if (!userDoc.exists)
      return ServiceResponse.failure(
        'User auth hilang',
        null,
        StatusCodes.NOT_FOUND
      );

    const fullData = {
      auth: {
        email: userDoc.data()?.email,
        fullname: userDoc.data()?.fullname,
        role: userDoc.data()?.role,
      },
      profile: profileDoc.exists ? profileDoc.data() : null,
    };

    return ServiceResponse.success('Data user ditemukan', fullData);
  }
}

export default new UserProfileService();
