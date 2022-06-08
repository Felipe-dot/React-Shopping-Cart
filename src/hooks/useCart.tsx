import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product , Stock } from '../types';

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
    const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart');
    
    if (storagedCart) {
      return JSON.parse(storagedCart);
    }else {
      return [];
    }
  });

  const addProduct = async (productId: number) => {
    try {
      var myProductIndex = cart.findIndex((element) => element.id === productId);
      const productStock = (await api.get(`stock/${productId}`)).data

      if(productStock.amount > 0 && myProductIndex !== -1) {
      
        cart[myProductIndex].amount += 1;
    
        setCart([...cart]);  

        localStorage.setItem('@RocketShoes:cart', JSON.stringify(cart))
      } else if(productStock.amount > 0 ) {
        var myProduct = (await api.get(`products/${productId}`)).data;
        cart.concat({
          id: myProduct.id,
          amount: myProduct.amount,
          image: myProduct.image,
          price: myProduct.price,
          title: myProduct.title,
        });

        setCart([...cart]);  

        localStorage.setItem('@RocketShoes:cart', JSON.stringify(cart))
      }
      else{
        toast.error('Quantidade solicitada fora de estoque');
      }
    } catch {
      toast.error('Erro na adição do produto');
    }
  };

  const removeProduct = (productId: number) => {
    try {
      var myProductIndex = cart.findIndex((element) => element.id === productId);
      cart.splice(myProductIndex,1);
      setCart([...cart]);
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(cart))
    } catch {
      toast.error('Erro na remoção do produto');
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      var myProductIndex = cart.findIndex((element) => element.id === productId);
      cart[myProductIndex].amount = amount;
      setCart([...cart]);
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(cart))
    } catch {
      toast.error('Erro na alteração de quantidade do produto');
    }
  };

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
