import whitePawn from '../img/figure/white-pawn.svg';
import whiteBishop from '../img/figure/white-bishop.svg';
import whiteKnight from '../img/figure/white-knight.svg';
import whiteRook from '../img/figure/white-rook.svg';
import whiteQueen from '../img/figure/white-queen.svg';
import whiteKing from '../img/figure/white-king.svg';
import blackPawn from '../img/figure/black-pawn.svg';
import blackBishop from '../img/figure/black-bishop.svg';
import blackKnight from '../img/figure/black-knight.svg';
import blackRook from '../img/figure/black-rook.svg';
import blackQueen from '../img/figure/black-queen.svg';
import blackKing from '../img/figure/black-king.svg';

const IMAGES = {
  W: { P: whitePawn, B: whiteBishop, N: whiteKnight, R: whiteRook, Q: whiteQueen, K: whiteKing },
  B: { P: blackPawn, B: blackBishop, N: blackKnight, R: blackRook, Q: blackQueen, K: blackKing },
};

export const PIECE_NAMES = { P: 'пешка', B: 'слон', N: 'конь', R: 'ладья', Q: 'ферзь', K: 'король' };

export function pieceImage(color, type) {
  return IMAGES[color][type];
}
