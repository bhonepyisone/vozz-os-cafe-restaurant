import { useAuth } from '../context/AuthContext'
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore'
import { db } from '../firebase-config'
import { useEffect, useState } from 'react'
import styles from '../styles/Admin.module.css'

export default function AdminPanel() {
  const { user } = useAuth()
  const [pendingShops, setPendingShops] = useState([])
  const [users, setUsers] = useState([])

  useEffect(() => {
    if (!user) return
    
    async function fetchData() {
      // Get pending shops
      const shopsQuery = query(
        collection(db, 'shops'),
        where('status', '==', 'pending')
      )
      const shopsSnapshot = await getDocs(shopsQuery)
      setPendingShops(shopsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
      
      // Get all users
      const usersSnapshot = await getDocs(collection(db, 'users'))
      setUsers(usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    }
    
    fetchData()
  }, [user])

  async function approveShop(shopId) {
    try {
      await updateDoc(doc(db, 'shops', shopId), {
        status: 'approved'
      })
      setPendingShops(pendingShops.filter(shop => shop.id !== shopId))
      alert('Shop approved successfully!')
    } catch (err) {
      console.error('Error approving shop: ', err)
      alert('Failed to approve shop')
    }
  }

  async function rejectShop(shopId) {
    try {
      await updateDoc(doc(db, 'shops', shopId), {
        status: 'rejected'
      })
      setPendingShops(pendingShops.filter(shop => shop.id !== shopId))
      alert('Shop rejected successfully!')
    } catch (err) {
      console.error('Error rejecting shop: ', err)
      alert('Failed to reject shop')
    }
  }

  return (
    <div className={styles.adminPanel}>
      <h1>Admin Panel</h1>
      
      <div className={styles.section}>
        <h2>Pending Shop Approvals</h2>
        {pendingShops.length === 0 ? (
          <p>No shops pending approval</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Shop ID</th>
                <th>Temporary Name</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingShops.map(shop => (
                <tr key={shop.id}>
                  <td>{shop.shopId}</td>
                  <td>{shop.name}</td>
                  <td>{new Date(shop.createdAt?.seconds * 1000).toLocaleDateString()}</td>
                  <td>
                    <button 
                      className={styles.approveBtn}
                      onClick={() => approveShop(shop.id)}
                    >
                      Approve
                    </button>
                    <button 
                      className={styles.rejectBtn}
                      onClick={() => rejectShop(shop.id)}
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      
      <div className={styles.section}>
        <h2>User Management</h2>
        <table>
          <thead>
            <tr>
              <th>Email</th>
              <th>Role</th>
              <th>Shop ID</th>
              <th>Last Login</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.email}</td>
                <td>{user.role || 'staff'}</td>
                <td>{user.shopId || 'None'}</td>
                <td>{user.lastLogin ? new Date(user.lastLogin?.seconds * 1000).toLocaleString() : 'Never'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
