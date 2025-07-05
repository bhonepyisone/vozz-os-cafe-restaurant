import { useAuth } from '../context/AuthContext'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase-config'
import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import styles from '../styles/Attendance.module.css'

export default function Attendance() {
  const { user } = useAuth()
  const [qrCode, setQrCode] = useState('')
  const [attendanceLogs, setAttendanceLogs] = useState([])
  const [location, setLocation] = useState({ lat: null, lng: null })

  useEffect(() => {
    // Generate QR code when user or location changes
    if (user?.uid && location.lat) {
      const data = JSON.stringify({
        staffId: user.uid,
        timestamp: new Date().getTime(),
        location: location
      })
      
      QRCode.toDataURL(data, { width: 200 }, (err, url) => {
        if (err) return console.error(err)
        setQrCode(url)
      })
    }
    
    // Get current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => {
          console.error("Error getting location: ", error)
        }
      )
    }
  }, [user])

  async function recordAttendance() {
    try {
      await addDoc(collection(db, 'attendance'), {
        staffId: user.uid,
        shopId: user.shopId,
        timestamp: serverTimestamp(),
        location: location,
        status: 'checked-in'
      })
      alert('Attendance recorded successfully!')
    } catch (err) {
      console.error('Error recording attendance: ', err)
      alert('Failed to record attendance')
    }
  }

  return (
    <div className={styles.attendance}>
      <h1>Staff Attendance</h1>
      
      <div className={styles.qrSection}>
        <h2>Your QR Code</h2>
        {qrCode ? (
          <>
            <img src={qrCode} alt="Attendance QR Code" />
            <p>Scan this code to check in</p>
            <p>Location: {location.lat?.toFixed(4)}, {location.lng?.toFixed(4)}</p>
          </>
        ) : (
          <p>Loading QR code...</p>
        )}
      </div>
      
      <div className={styles.manualCheckin}>
        <h2>Manual Check-In</h2>
        <button onClick={recordAttendance}>Check In Now</button>
      </div>
      
      <div className={styles.attendanceHistory}>
        <h2>Your Attendance History</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {attendanceLogs.map((log, index) => (
              <tr key={index}>
                <td>{new Date(log.timestamp?.seconds * 1000).toLocaleDateString()}</td>
                <td>{new Date(log.timestamp?.seconds * 1000).toLocaleTimeString()}</td>
                <td>{log.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
