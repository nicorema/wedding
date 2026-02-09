import styles from './PageContainer.module.scss'

function PageContainer({ children }) {
  return (
    <div className={styles.container}>
      {children}
    </div>
  )
}

export default PageContainer

