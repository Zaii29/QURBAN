import { supabase } from './supabaseClient';

const kurbanData = [
  // SAPI 1
  { 
    type: 'sapi', 
    group_name: 'Sapi-1', 
    weight: 300, 
    status: 'Menunggu', 
    customer_name: 'Indraningsih, Allenno Zaimusy, Keluarga Juwanto, Hendri bin Suwandi, Agung Wibowo, Ibu Rodiah, Bpk Sigit Prasetyo',
    phone_number: '628123456789'
  },
  // SAPI 2
  { 
    type: 'sapi', 
    group_name: 'Sapi-2', 
    weight: 300, 
    status: 'Menunggu', 
    customer_name: 'Ratno wijoyo, Heri setiawan, Pipit Agustina, Zyan Arjuna, Adi Surya, Keluarga Andrianto, Keluarga bpk Audy',
    phone_number: '628123456789'
  },
  // KAMBING
  { type: 'kambing', group_name: '', weight: 45, status: 'Menunggu', customer_name: 'Tsara Anindia Irawan Binti Candra Irawan', phone_number: '628123456789' },
  { type: 'kambing', group_name: '', weight: 45, status: 'Menunggu', customer_name: 'Ibu Choiriyah Nur a.n Unaisih binti Marsa (CGN)' },
  { type: 'kambing', group_name: '', weight: 45, status: 'Menunggu', customer_name: 'Satyndra Jaswal bin Satender Kumar Jaswal (B1 no.10 )' },
  { type: 'kambing', group_name: '', weight: 45, status: 'Menunggu', customer_name: 'Ibu Fatimah binti Tahril AL 6 No 19' },
  { type: 'kambing', group_name: '', weight: 45, status: 'Menunggu', customer_name: 'Suharyanto bin Sugiyono AL 5 No 35' },
  { type: 'kambing', group_name: '', weight: 45, status: 'Menunggu', customer_name: 'Zalfa Junneta Nurisky binti Riky Efrianto (AL 3)' },
  { type: 'kambing', group_name: '', weight: 45, status: 'Menunggu', customer_name: 'Muhammad Zidane Arfaiz bin Ricky setiadi. CGN' },
  { type: 'kambing', group_name: '', weight: 45, status: 'Menunggu', customer_name: 'Taufik Fajrin bin H Madinah. Ros 5 No 21' },
  { type: 'kambing', group_name: '', weight: 45, status: 'Menunggu', customer_name: 'Keysha Dwiaulia binti Bambang Sumbodo. Bogenvile 3 No 6' },
  { type: 'kambing', group_name: '', weight: 45, status: 'Menunggu', customer_name: 'Eris Yaswandi bin Ilyas (Bogenville 3 No.5)' },
  { type: 'kambing', group_name: '', weight: 45, status: 'Menunggu', customer_name: 'Bapak Eli Ermayadi bin Iding (CGN)' },
  { type: 'kambing', group_name: '', weight: 45, status: 'Menunggu', customer_name: 'Sumiyati binti muhamad Saleh Ros 1 No8' },
  { type: 'kambing', group_name: '', weight: 45, status: 'Menunggu', customer_name: 'Kiki Ismiawati binti Romli AL 4 No 15/ pak Fariz' }
];

export const seedKurbanData = async () => {
  try {
    // 1. Delete all existing animals data
    const { error: deleteError } = await supabase
      .from('animals')
      .delete()
      .neq('id', 0); // condition to match all rows

    if (deleteError) {
      console.error('Error deleting old data:', deleteError);
      alert('Gagal menghapus data lama: ' + deleteError.message);
      return false;
    }

    // 2. Insert corrected grouped data
    const { data, error } = await supabase
      .from('animals')
      .insert(kurbanData);

    if (error) {
      console.error('Error seeding data:', error);
      alert('Gagal memasukkan data baru: ' + error.message);
      return false;
    }

    console.log('Data berhasil dimasukkan:', data);
    alert('Data jemaah kurban berhasil diperbarui menjadi format patungan!');
    return true;
  } catch (err) {
    console.error('Unexpected error:', err);
    alert('Terjadi kesalahan yang tidak terduga.');
    return false;
  }
};
