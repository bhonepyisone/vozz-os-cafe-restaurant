import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { collection, getDocs, addDoc } from 'firebase/firestore'
import { db } from '../firebase-config'

export default function POS() {
  const { user } = useAuth()
  const [menuItems, setMenuItems] = useState([])
  const [cart, setCart] = useState([])
  const [total, setTotal] = useState(0)

  useEffect(() => {
    async function fetchMenu() {
      const querySnapshot = await getDocs(collection(db, 'menuItems'))
      setMenuItems(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    }
    fetchMenu()
  }, [])

  function addToCart(item) {
    setCart([...cart, item])
    setTotal(total + item.price)
  }

  async function checkout() {
    try {
      await addDoc(collection(db, 'sales'), {
        items: cart,
        total: total,
        shopId: user.shopId,
        createdAt: new Date()
      })
      setCart([])
      setTotal(0)
      alert('Order completed!')
    } catch (err) {
      console.error('Error completing order: ', err)
    }
  }

  return (
    <div className="pos-container">
      <h1>Point of Sale</h1>
      <div className="menu-items">
        {menuItems.map(item => (
          <button key={item.id} onClick={() => addToCart(item)}>
            {item.name} - ${item.price}
          </button>
        ))}
      </div>
      <div className="cart">
        <h2>Your Order</h2>
        {cart.map((item, index) => (
          <p key={index}>{item.name} - ${item.price}</p>
        ))}
        <h3>Total: ${total.toFixed(2)}</h3>
        <button onClick={checkout}>Complete Order</button>
      </div>
    </div>
  )
}
