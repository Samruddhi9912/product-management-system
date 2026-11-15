
import { useEffect, useState } from 'react'
import './App.css'

import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getNextProductId,
  getProductsByPrice,
  getProductsByCategory,
  getTopStockProducts,
} from './services/productService'

const emptyForm = {
  productName: '',
  category: '',
  price: '',
  quantity: '',
}

function App() {
  const [products, setProducts] = useState([])
  const [activeSection, setActiveSection] = useState('dashboard')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [formData, setFormData] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [nextProductId, setNextProductId] = useState(null)
  const [idLoading, setIdLoading] = useState(false)
  const [updateId, setUpdateId] = useState('')
  const [deleteId, setDeleteId] = useState('')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')

  const [reportType, setReportType] = useState('category')
  const [reportCategory, setReportCategory] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [topLimit, setTopLimit] = useState('5')
  const [reportResults, setReportResults] = useState([])
  const [reportLoading, setReportLoading] = useState(false)
  const [reportError, setReportError] = useState('')

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const data = await getAllProducts()
      setProducts(data)
      setError('')
    } catch (err) {
      setError('Unable to load products. Please check your backend.')
    } finally {
      setLoading(false)
    }
  }

  const fetchNextProductId = async () => {
    try {
      setIdLoading(true)
      const id = await getNextProductId()
      setNextProductId(id)
    } catch (err) {
      setNextProductId(null)
      setError('Unable to fetch the next Product ID.')
    } finally {
      setIdLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    if (activeSection === 'add') {
      fetchNextProductId()
    }
  }, [activeSection])

  const showSection = (section) => {
    setActiveSection(section)
    setMessage('')
    setError('')
    setSelectedProduct(null)
    setFormData(emptyForm)
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleAddProduct = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    setError('')

    try {
      await createProduct({
        productName: formData.productName.trim(),
        category: formData.category.trim(),
        price: Number(formData.price),
        quantity: Number(formData.quantity),
      })

      setFormData(emptyForm)
      setMessage('Product added successfully.')
      await fetchProducts()
      await fetchNextProductId()
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Unable to add product. Please check the details.'
      )
    } finally {
      setSaving(false)
    }
  }

  const loadProductForUpdate = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setSelectedProduct(null)

    try {
      const product = await getProductById(updateId)
      setSelectedProduct(product)
      setFormData({
        productName: product.productName,
        category: product.category,
        price: product.price,
        quantity: product.quantity,
      })
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Product not found.'
      )
    }
  }

  const handleUpdateProduct = async (e) => {
    e.preventDefault()
    if (!selectedProduct) return

    setSaving(true)
    setError('')
    setMessage('')

    try {
      await updateProduct(selectedProduct.productId, {
        productName: formData.productName.trim(),
        category: formData.category.trim(),
        price: Number(formData.price),
        quantity: Number(formData.quantity),
      })

      setMessage('Product updated successfully.')
      setSelectedProduct(null)
      setUpdateId('')
      setFormData(emptyForm)
      await fetchProducts()
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Unable to update product.'
      )
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteProduct = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')

    try {
      await deleteProduct(deleteId)
      setMessage('Product deleted successfully.')
      setDeleteId('')
      setSelectedProduct(null)
      await fetchProducts()
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Unable to delete product. Check the product ID.'
      )
    }
  }

  const handleRunReport = async (e) => {
    e.preventDefault()
    setReportLoading(true)
    setReportError('')
    setReportResults([])

    try {
      let data

      if (reportType === 'category') {
        if (!reportCategory) {
          setReportError('Please select a category.')
          return
        }
        data = await getProductsByCategory(reportCategory)
      } else if (reportType === 'price') {
        if (minPrice === '' || Number(minPrice) < 0) {
          setReportError('Please enter a valid minimum price.')
          return
        }
        data = await getProductsByPrice(Number(minPrice))
      } else {
        const limit = Number(topLimit)
        if (!Number.isInteger(limit) || limit < 1) {
          setReportError('Limit must be at least 1.')
          return
        }
        data = await getTopStockProducts(limit)
      }

      setReportResults(Array.isArray(data) ? data : [])

      if (!Array.isArray(data)) {
        setReportError('The report returned an unexpected response format.')
      }
    } catch (err) {
      setReportError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Unable to generate report.'
      )
    } finally {
      setReportLoading(false)
    }
  }

  const categories = [...new Set(products.map((p) => p.category))]

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.productName
      .toLowerCase()
      .includes(search.toLowerCase())

    const matchesCategory =
      categoryFilter === 'All' || product.category === categoryFilter

    return matchesSearch && matchesCategory
  })

  const totalStock = products.reduce((sum, p) => sum + p.quantity, 0)
  const lowStock = products.filter((p) => p.lowStock).length
  const inventoryValue = products.reduce(
    (sum, p) => sum + p.price * p.quantity,
    0
  )

  const pageTitles = {
    dashboard: 'Home',
    add: 'Add Product',
    update: 'Update Product',
    view: 'View Products',
    delete: 'Delete Product',
    reports: 'Reports',
  }

  const renderProductTable = (items) => (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>PRODUCT</th>
            <th>PRODUCT ID</th>
            <th>CATEGORY</th>
            <th>PRICE</th>
            <th>QUANTITY</th>
            <th>STATUS</th>
          </tr>
        </thead>
        <tbody>
          {items.map((product) => (
            <tr key={product.productId}>
              <td>
                <div className="product-cell">
                  <span className="product-initial">
                    {product.productName.charAt(0).toUpperCase()}
                  </span>
                  <strong>{product.productName}</strong>
                </div>
              </td>
              <td>#{product.productId}</td>
              <td>{product.category}</td>
              <td>₹{Number(product.price).toLocaleString('en-IN')}</td>
              <td>{product.quantity} units</td>
              <td>
                <span className={`status ${product.lowStock ? 'low' : 'available'}`}>
                  {product.lowStock ? 'Low Stock' : 'In Stock'}
                </span>
              </td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td colSpan="6" className="empty-state">No products found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )


const renderProductForm = (submitHandler, buttonText, isAddForm = false) => (
  <form className={`form-card ${isAddForm ? 'add-form-card' : ''}`} onSubmit={submitHandler}>

    {isAddForm && (
      <div className="add-form-toolbar">
        <button
          type="button"
          className="secondary-button"
          onClick={() => {
            setFormData(emptyForm)
            setSelectedProduct(null)
          }}
        >
          Clear
        </button>
      </div>
    )}

    <div className="form-grid">
      {isAddForm && (
        <div className="form-field full-width">
          <label>Product ID</label>
          <input
            type="text"
            value={
              idLoading
                ? 'Fetching Product ID...'
                : nextProductId !== null
                  ? nextProductId
                  : 'Unable to fetch ID'
            }
            readOnly
          />
        </div>
      )}

      <div className="form-field full-width">
        <label>Product Name</label>
        <input
          name="productName"
          value={formData.productName}
          onChange={handleInputChange}
          placeholder="Enter product name"
          maxLength="100"
          required
        />
      </div>

      <div className="form-field full-width">
        <label>Category</label>
        <input
          name="category"
          value={formData.category}
          onChange={handleInputChange}
          placeholder="Example: Electronics"
          maxLength="50"
          required
        />
      </div>

      <div className="form-field">
        <label>Price (₹)</label>
        <input
          type="number"
          name="price"
          value={formData.price}
          onChange={handleInputChange}
          placeholder="Enter price"
          min="0.01"
          step="0.01"
          required
        />
      </div>

      <div className="form-field">
        <label>Quantity</label>
        <input
          type="number"
          name="quantity"
          value={formData.quantity}
          onChange={handleInputChange}
          placeholder="Enter quantity"
          min="0"
          step="1"
          required
        />
      </div>
    </div>

    <div className={isAddForm ? 'add-form-actions' : 'form-actions'}>
      {!isAddForm && (
        <button
          type="button"
          className="secondary-button"
          onClick={() => {
            setFormData(emptyForm)
            setSelectedProduct(null)
          }}
        >
          Clear
        </button>
      )}

      <button
        className="primary-button"
        type="submit"
        disabled={saving || (isAddForm && (idLoading || nextProductId === null))}
      >
        {saving ? 'Please wait...' : buttonText}
      </button>
    </div>

    {isAddForm && (
      <div className="add-back-container">
        <button
          type="button"
          className="secondary-button"
          onClick={() => showSection('dashboard')}
        >
          ← Back to Home
        </button>
      </div>
    )}
  </form>
)


  return (
    <div className="app-layout">
      <main className="main-content">
        <header className="topbar">
          <div className="topbar-brand-row">
            <button
              className="brand brand-button"
              onClick={() => showSection('dashboard')}
            >
              <span className="brand-mark">P</span>
              <span>
                Product<span className="brand-accent">Desk</span>
              </span>
            </button>

            {activeSection !== 'dashboard' && activeSection !== 'add' && (
              <button
                className="secondary-button"
                onClick={() => showSection('dashboard')}
              >
                ← Back to Home
              </button>
            )}

            {activeSection === 'dashboard' && (
              <div className="topbar-status">
                <span className="online-dot"></span>
                Inventory system
              </div>
            )}
          </div>

          {activeSection !== 'dashboard' && (
            <h1>{pageTitles[activeSection]}</h1>
          )}
        </header>

        {message && <div className="alert success-alert">{message}</div>}
        {error && <div className="alert error-alert">{error}</div>}

        {activeSection === 'dashboard' && (
          <>
            <section className="home-banner">
              <div className="home-banner-content">
                <span className="banner-label">PRODUCT MANAGEMENT</span>
                <h2>Manage your inventory with ease.</h2>
                <p>
                  Add products, track stock and keep all your inventory
                  information organised in one place.
                </p>
              </div>
            </section>

            <section className="action-grid">
              <button className="action-card" onClick={() => showSection('add')}>
                <span className="action-symbol">＋</span>
                <span className="action-card-text">
                  <strong>Add Product</strong>
                  <small>Add a new item to your inventory</small>
                </span>
                <span className="action-arrow">→</span>
              </button>

              <button className="action-card" onClick={() => showSection('update')}>
                <span className="action-symbol">✎</span>
                <span className="action-card-text">
                  <strong>Update Product</strong>
                  <small>Edit existing product information</small>
                </span>
                <span className="action-arrow">→</span>
              </button>

              <button className="action-card" onClick={() => showSection('view')}>
                <span className="action-symbol">▤</span>
                <span className="action-card-text">
                  <strong>View Products</strong>
                  <small>Browse and filter your inventory</small>
                </span>
                <span className="action-arrow">→</span>
              </button>

              <button className="action-card" onClick={() => showSection('delete')}>
                <span className="action-symbol">
                  <svg
                    width="21"
                    height="21"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M3 6h18" />
                    <path d="M8 6V4h8v2" />
                    <path d="M19 6l-1 14H6L5 6" />
                    <path d="M10 11v5" />
                    <path d="M14 11v5" />
                  </svg>
                </span>
                <span className="action-card-text">
                  <strong>Delete Product</strong>
                  <small>Remove a product from inventory</small>
                </span>
                <span className="action-arrow">→</span>
              </button>

              <button className="action-card" onClick={() => showSection('reports')}>
                <span className="action-symbol">▥</span>
                <span className="action-card-text">
                  <strong>Reports</strong>
                  <small>Explore stock and category reports</small>
                </span>
                <span className="action-arrow">→</span>
              </button>
            </section>

            <section className="stats-grid">
              <div className="stat-card">
                <span>Total Products</span>
                <h2>{loading ? '—' : products.length}</h2>
              </div>

              <div className="stat-card">
                <span>Total Stock</span>
                <h2>{loading ? '—' : totalStock}</h2>
              </div>

              <div className="stat-card">
                <span>Low Stock</span>
                <h2>{loading ? '—' : lowStock}</h2>
              </div>

              <div className="stat-card">
                <span>Inventory Value</span>
                <h2>
                  {loading ? '—' : `₹${inventoryValue.toLocaleString('en-IN')}`}
                </h2>
              </div>
            </section>
          </>
        )}

        {activeSection === 'add' && (
          <section className="content-section">
            {renderProductForm(handleAddProduct, 'Save Product', true)}
          </section>
        )}

        {activeSection === 'update' && (
          <section className="content-section">
            <div className="section-heading">
              <h2>Update Product Details</h2>
              <p>First enter the product ID to load its current details.</p>
            </div>

            <form className="lookup-form" onSubmit={loadProductForUpdate}>
              <div className="form-field">
                <label>Product ID</label>
                <input
                  type="number"
                  min="1"
                  value={updateId}
                  onChange={(e) => setUpdateId(e.target.value)}
                  placeholder="Enter product ID"
                  required
                />
              </div>
              <button className="primary-button" type="submit">Find Product</button>
            </form>

            {selectedProduct && renderProductForm(handleUpdateProduct, 'Update Product')}
          </section>
        )}

        {activeSection === 'view' && (
          <section className="content-section">
            <div className="section-heading">
              <h2>All Products</h2>
              <p>Search products or filter your inventory by category.</p>
            </div>

            <div className="toolbar">
              <input
                className="search-box"
                placeholder="Search by product name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="All">All Categories</option>
                {categories.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>

            {loading
              ? <p className="message">Loading products...</p>
              : renderProductTable(filteredProducts)}
          </section>
        )}

        {activeSection === 'delete' && (
          <section className="content-section">
            <div className="section-heading">
              <h2>Delete a Product</h2>
              <p>Choose a product and confirm before deleting it.</p>
            </div>

            <form className="delete-card" onSubmit={handleDeleteProduct}>
              <div className="form-field">
                <label>Select Product</label>
                <select
                  value={deleteId}
                  onChange={(e) => setDeleteId(e.target.value)}
                  required
                >
                  <option value="">Choose a product</option>
                  {products.map((product) => (
                    <option key={product.productId} value={product.productId}>
                      #{product.productId} — {product.productName}
                    </option>
                  ))}
                </select>
              </div>

              <p className="delete-warning">
                Deleting a product is permanent. Please check the selected
                product before continuing.
              </p>

              <button className="danger-button" type="submit" disabled={!deleteId}>
                Delete Product
              </button>
            </form>
          </section>
        )}

        {activeSection === 'reports' && (
          <section className="content-section">
            <div className="section-heading">
              <h2>Inventory Reports</h2>
              <p>Generate reports using product category, price and stock filters.</p>
            </div>

            <form className="report-card" onSubmit={handleRunReport}>
              <div className="form-field">
                <label>Report Type</label>
                <select
                  value={reportType}
                  onChange={(e) => {
                    setReportType(e.target.value)
                    setReportResults([])
                    setReportError('')
                  }}
                >
                  <option value="category">Products by Category</option>
                  <option value="price">Products above a Minimum Price</option>
                  <option value="top">Top Stock Products</option>
                </select>
              </div>

              {reportType === 'category' && (
                <div className="form-field">
                  <label>Choose Category</label>
                  <select
                    value={reportCategory}
                    onChange={(e) => setReportCategory(e.target.value)}
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map((item) => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                </div>
              )}

              {reportType === 'price' && (
                <div className="form-field">
                  <label>Minimum Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    placeholder="Enter minimum price"
                    required
                  />
                </div>
              )}

              {reportType === 'top' && (
                <div className="form-field">
                  <label>Number of Products</label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={topLimit}
                    onChange={(e) => setTopLimit(e.target.value)}
                    required
                  />
                </div>
              )}

              <button className="primary-button" type="submit" disabled={reportLoading}>
                {reportLoading ? 'Generating...' : 'Generate Report'}
              </button>
            </form>

            {reportError && <div className="alert error-alert">{reportError}</div>}

            {reportResults.length > 0 && (
              <div className="report-results">
                <div className="section-heading">
                  <h2>Report Results</h2>
                  <p>{reportResults.length} products found</p>
                </div>
                {renderProductTable(reportResults)}
              </div>
            )}

            {!reportLoading && reportResults.length === 0 && !reportError && (
              <p className="report-hint">
                Choose a report type and generate a report to see the results.
              </p>
            )}
          </section>
        )}

        {activeSection !== 'dashboard' && (
          <footer className="footer">
            ProductDesk <span>·</span> Product Management System
          </footer>
        )}
      </main>
    </div>
  )
}

export default App
