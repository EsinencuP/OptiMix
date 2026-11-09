import { ArrowRight, ArrowLeft, ArrowDown, RotateCw, ChartNoAxesCombined, ChartColumn, Check, CheckCheck, CheckCircle2, ChevronRight, ChevronDown, ChevronLeft, Circle, Clock, ContactRound, Database, Eye, FileText, File, Files, House, Image, Layers, List, Mail, MessageSquare, Phone, Plus, Search, Settings2, Shield, ShoppingCart, SquareCheck, Table2, TriangleAlert, Users, Wallet, X } from 'lucide-react';
const icons = {
    'arrow-right': ArrowRight, 'arrow-left': ArrowLeft, 'arrow-down': ArrowDown, 'arrow-clockwise': RotateCw,
    'chart-bar': ChartColumn, 'chart-line-up': ChartNoAxesCombined, 'check': Check, 'check-circle': CheckCircle2, 'check-circle-fill': CheckCircle2, 'check-square': SquareCheck, 'check-check': CheckCheck,
    'caret-down': ChevronDown, 'caret-right': ChevronRight, 'caret-left': ChevronLeft, 'circle': Circle, 'circle-muted': Circle, 'radio-button': Circle,
    'clock': Clock, 'address-book': ContactRound, 'database': Database, 'eye': Eye, 'file-text': FileText, 'file-pdf': File, 'files': Files, 'house': House, 'image': Image, 'layers': Layers, 'list': List, 'mail': Mail, 'chat': MessageSquare, 'phone': Phone, 'plus': Plus, 'search': Search, 'gear': Settings2, 'shield': Shield, 'shopping-cart': ShoppingCart, 'table': Table2, 'warning': TriangleAlert, 'users': Users, 'wallet': Wallet, 'x': X,
};
interface Props {
    name: string;
    className?: string;
    size?: number;
}
export default function Icon({ name, className, size = 24 }: Props) {
    const Symbol = icons[name as keyof typeof icons];
    return Symbol ? <Symbol className={['ox-icon', className].filter(Boolean).join(' ')} width={size} height={size} strokeWidth={1.8} aria-hidden="true" focusable="false"/> : <img className={['ox-icon', className].filter(Boolean).join(' ')} src={`/icons/phosphor/${name}.svg`} width={size} height={size} alt="" aria-hidden="true"/>;
}
