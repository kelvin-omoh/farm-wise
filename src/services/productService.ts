import { db } from '../config/firebase'
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, DocumentReference } from 'firebase/firestore'
import { Product } from '../pages/marketplace/ProductCard'

export const getProducts = async (): Promise<Product[]> => {
    const productsCollection = collection(db, 'products')
    const productSnapshot = await getDocs(productsCollection)
    return productSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    })) as Product[]
}

export const addProduct = async (product: Product): Promise<DocumentReference> => {
    return await addDoc(collection(db, 'products'), product)
}

export const updateProduct = async (id: string, product: Partial<Product>) => {
    const productRef = doc(db, 'products', id)
    await updateDoc(productRef, product)
}

export const deleteProduct = async (id: string) => {
    const productRef = doc(db, 'products', id)
    await deleteDoc(productRef)
} 