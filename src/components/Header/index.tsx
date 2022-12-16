import { MdShoppingBasket } from 'react-icons/md';
import { Link } from 'react-router-dom';

import logo from '../../assets/images/logo.svg';
import { useCart } from '../../hooks/useCart';
import { Cart, Container } from './styles';

const Header = (): JSX.Element => {
  const { cart } = useCart();
  function getCartSize() {
    let result: number = 0;
    let ids: number[] = [];

    cart.forEach((product) => {
      if (!ids.includes(product.id)) {
        result++;
        ids.push(product.id);
      }
    });

    return result;
  }

  const cartSize = getCartSize()

  return (
    <Container>
      <Link to="/">
        <img src={logo} alt="Rocketshoes" />
      </Link>

      <Cart to="/cart">
        <div>
          <strong>Meu carrinho</strong>
          <span data-testid="cart-size">
            {cartSize === 1 ? `${cartSize} item` : `${cartSize} itens`}
          </span>
        </div>
        <MdShoppingBasket size={36} color="#FFF" />
      </Cart>
    </Container>
  );
};

export default Header;
