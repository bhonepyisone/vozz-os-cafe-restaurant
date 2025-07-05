import { useAuth } from '../context/AuthContext'
import { collection, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore'
import { db } from '../firebase-config'
import { useEffect, useState } from 'react'
import styles from '../styles/Inventory.module.css'

export default function Inventory() {
  const { user } = useAuth()
  const [inventory, setInventory] = useState([])
  const [newItem, setNewItem] = useState({
    name: '',
    quantity: 0,
    threshold: 5,
    unit: 'units'
  })

  useEffect(() => {
    async function fetchInventory() {
      if (!user?.shopId) return
      
      const querySnapshot = await getDocs(collection(db, 'inventory'))
      const items = querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(item => item.shopId === user.shopId)
      
      setInventory(items)
    }
    
    fetchInventory()
  }, [user])

  async function addItem() {
    if (!newItem.name) return
    
    try {
      await addDoc(collection(db, 'inventory'), {
        ...newItem,
        shopId: user.shopId
      })
      setNewItem({ name: '', quantity: 0, threshold: 5, unit: 'units' })
      // Refresh inventory
      const querySnapshot = await getDocs(collection(db, 'inventory'))
      setInventory(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    } catch (err) {
      console.error('Error adding item: ', err)
    }
  }

  async function updateQuantity(id, change) {
    const item = inventory.find(item => item.id === id)
    const newQty = item.quantity + change
    
    try {
      await updateDoc(doc(db, 'inventory', id), {
        quantity: newQty
      })
      setInventory(inventory.map(item => 
        item.id === id ? { ...item, quantity: newQty } : item
      ))
    } catch (err) {
      console.error('Error updating quantity: ', err)
    }
  }

  return (
    <div className={styles.inventory}>
      <h1>Inventory Management</h1>
      
      <div className={styles.addItem}>
        <h2>Add New Item</h2>
        <div className={styles.formGroup}>
          <input
            type="text"
            placeholder="Item name"
            value={newItem.name}
            onChange={(e) => setNewItem({...newItem, name: e.target.value})}
          />
          <input
            type="number"
            placeholder="Quantity"
            value={newItem.quantity}
            onChange={(e) => setNewItem({...newItem, quantity: parseInt(e.target.value) || 0})}
          />
          <select
            value={newItem.unit}
            onChange={(e) => setNewItem({...newItem, unit: e.target.value})}
          >
            <option value="units">Units</option>
            <option value="kg">Kilograms</option>
            <option value="g">Grams</option>
            <option value="L">Liters</option>
            <option value="ml">Milliliters</option>
          </select>
          <button onClick={addItem}>Add Item</button>
        </div>
      </div>
      
      <div className={styles.inventoryList}>
        <h2>Current Inventory</h2>
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Quantity</th>
              <th>Unit</th>
              <th>Reorder Threshold</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map(item => (
              <tr key={item.id} className={item.quantity <= item.threshold ? styles.lowStock : ''}>
                <td>{item.name}</td>
                <td>{item.quantity}</td>
                <td>{item.unit}</td>
                <td>{item.threshold}</td>
                <td>
                  <button onClick={() => updateQuantity(item.id, 1)}>+1</button>
                  <button onClick={() => updateQuantity(item.id, -1)}>-1</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
