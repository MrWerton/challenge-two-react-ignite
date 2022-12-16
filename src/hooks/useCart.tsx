import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const _getCartInStorage = () => {
    const storageCart = localStorage.getItem('@RocketShoes:cart')
    if (storageCart) {
      const cart = JSON.parse(storageCart);
      return cart
    }
    return []
  }
  const [cart, setCart] = useState<Product[]>(_getCartInStorage())
  async function _getStock(productId: number) {
    const response = await api.get<Stock>(`stock/${productId}`);
    const stock = response.data
    return stock
  }
  async function _getProduct(productId: number) {
    const response = await api.get<Product>(`products/${productId}`);
    const product = response.data
    return product
  }
  async function _addCartInStorage(cart: Product[]) {
    const productFormatted = JSON.stringify(cart)
    localStorage.setItem('@RocketShoes:cart', productFormatted)
  }

  const addProduct = async (productId: number) => {
    try {
      const newCart = [...cart];
      const stock = await _getStock(productId)
      const stockAmount = stock.amount;
      const currentAmount = newCart.find(product => product.id === productId)?.amount || 0;

      if (stockAmount <= currentAmount) {
        toast.error('Quantidade solicitada fora de estoque');
        return
      }

      const productExists = newCart.find(product => product.id === productId);

      if (productExists) {
        productExists.amount = currentAmount + 1;
      } else {
        const product = await _getProduct(productId)
        newCart.push({
          ...product,
          amount: 1
        });
      }
      setCart(newCart);
      _addCartInStorage(newCart)
    } catch {
      toast.error('Erro na adição do produto');
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const newCart = [...cart];
      const productIndex = newCart.findIndex(product => product.id === productId);

      if (productIndex >= 0) {
        newCart.splice(productIndex, 1);
        setCart(newCart);
        _addCartInStorage(newCart)
        return;
      } else {
        throw new Error('Product not exists');
      }

    } catch {
      toast.error('Erro na remoção do produto');
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      if (amount <= 0) {
        return;
      }
      const stock = await _getStock(productId)
      const stockAmount = stock.amount;

      if (stockAmount < amount) {
        toast.error('Quantidade solicitada fora de estoque');
        return;
      }

      const newCart = [...cart];
      const product = newCart.find(product => product.id === productId);

      if (product) {
        product.amount++;
        setCart(newCart);
        _addCartInStorage(newCart)
      } else {
        throw new Error('product not found');
      }

    } catch {
      toast.error('Erro na alteração de quantidade do produto');
    }
  };

  useEffect(() => {
    _getCartInStorage()
  }, [])

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
