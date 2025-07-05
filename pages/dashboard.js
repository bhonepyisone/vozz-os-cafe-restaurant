import { useAuth } from '../context/AuthContext'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '../firebase-config'
import { useEffect, useState } from 'react'
import styles from '../styles/Dashboard.module.css'

export default function Dashboard() {
  const { user } = useAuth()
  const [salesData, setSalesData] = useState([])
  const [kpis, setKpis] = useState({
    totalSales: 0,
    avgOrderValue: 0,
    popularItem: 'Loading...',
    tablesTurned: 0
  })

  useEffect(() => {
    async function fetchSalesData() {
      if (!user?.shopId) return
      
      const salesQuery = query(
        collection(db, 'sales'),
        where('shopId', '==', user.shopId)
      )
      const querySnapshot = await getDocs(salesQuery)
      const sales = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      
      setSalesData(sales)
      
      // Calculate KPIs
      const total = sales.reduce((sum, sale) => sum + sale.total, 0)
      const avg = sales.length > 0 ? total / sales.length : 0
      
      // Find popular item
      const itemCounts = {}
      sales.forEach(sale => {
        sale.items.forEach(item => {
          itemCounts[item.name] = (itemCounts[item.name] || 0) + 1
        })
      })
      const popular = Object.entries(itemCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None'
      
      setKpis({
        totalSales: total,
        avgOrderValue: avg,
        popularItem: popular,
        tablesTurned: sales.length
      })
    }
    
    fetchSalesData()
  }, [user])

  return (
    <div className={styles.dashboard}>
      <h1>Restaurant Dashboard</h1>
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <h2>Total Sales</h2>
          <p>${kpis.totalSales.toFixed(2)}</p>
        </div>
        <div className={styles.kpiCard}>
          <h2>Avg. Order Value</h2>
          <p>${kpis.avgOrderValue.toFixed(2)}</p>
        </div>
        <div className={styles.kpiCard}>
          <h2>Popular Item</h2>
          <p>{kpis.popularItem}</p>
        </div>
        <div className={styles.kpiCard}>
          <h2>Tables Turned</h2>
          <p>{kpis.tablesTurned}</p>
        </div>
      </div>
      
      <div className={styles.recentSales}>
        <h2>Recent Sales</h2>
        <table>
          <thead>
            <tr>
              <th>Time</th>
              <th>Items</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {salesData.slice(0, 5).map(sale => (
              <tr key={sale.id}>
                <td>{new Date(sale.createdAt?.seconds * 1000).toLocaleTimeString()}</td>
                <td>{sale.items.map(item => item.name).join(', ')}</td>
                <td>${sale.total.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
