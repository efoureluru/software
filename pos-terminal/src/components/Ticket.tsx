import type { Ride } from '../data/rides';
import { forwardRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface CartItem extends Ride {
    quantity: number;
}

interface TicketProps {
    items: CartItem[];
    total: number;
    date: string;
    ticketId: string;
    mobileNumber?: string;
}

export const Ticket = forwardRef<HTMLDivElement, TicketProps & { subTickets?: any[], skipMaster?: boolean }>(({ items, total, date, ticketId, mobileNumber, subTickets, skipMaster }, ref) => {

    const TicketContent = ({ data, isCoupon = false, index = 0 }: { data: any, isCoupon?: boolean, index?: number }) => (
        <div className={`bg-white text-black font-mono ${isCoupon ? 'page-break-before' : ''}`}
            style={{
                width: '2.5in', // Reduced width to prevent cropping
                padding: '0 2px 0 0',
                marginLeft: '0',
                pageBreakBefore: isCoupon ? 'always' : 'auto',
                fontSize: '11px',
                lineHeight: '1.2'
            }}
        >
            {/* Header Section */}
            <div className="text-center border-b-4 border-black pb-2 mb-2">
                <img src="/e3logo.jpeg" alt="Logo" className="w-12 h-12 mx-auto mb-1 rounded-md" />
                <h1 className="font-black text-2xl uppercase tracking-widest leading-none mb-1">ETHREE</h1>
                <h2 className="font-bold text-xs uppercase tracking-wider leading-none">EAT • ENJOY • ENTERTAIN</h2>
            </div >

            {/* Meta Info */}
            < div className="flex flex-col text-[10px] uppercase font-bold text-left mb-2 leading-tight" >
                <span>{date}</span>
                <span>TICKET #: <span className="text-sm">{data.id}</span></span>
                {mobileNumber && <span>MOB: {mobileNumber}</span>}
                {isCoupon && <span className="bg-black text-white px-1 py-0.5 mt-1 inline-block mr-auto rounded-sm">RIDE TICKET {index} OF 5</span>}
            </div >

            {/* Separator */}
            < div className="border-b border-dashed border-black mb-2 opacity-50" ></div >

            {/* Items List */}
            {
                !isCoupon && (
                    <div className="mb-2">
                        {items.map((item) => (
                            <div key={item.id} className="flex justify-between items-start mb-1">
                                <span className="font-bold truncate w-[75%]">{item.quantity} x {item.name.toUpperCase()}</span>
                                <span className="font-bold">₹{item.price * item.quantity}</span>
                            </div>
                        ))}
                    </div>
                )
            }

            {
                isCoupon && (
                    <div className="text-center py-2 border-2 border-black mb-2">
                        <p className="font-black text-2xl uppercase">ANY RIDE</p>
                        <p className="font-bold text-lg mt-1">WORTH: ₹100</p>
                        <p className="text-[10px] uppercase mt-1">Single Use Only</p>
                    </div>
                )
            }

            {/* Total Section */}
            {
                !isCoupon && (
                    <div className="border-t-2 border-black pt-1 mb-3">
                        <div className="flex justify-between items-center text-xl font-black">
                            <span>TOTAL</span>
                            <span>₹{total}</span>
                        </div>
                    </div>
                )
            }

            {/* QR Code Section */}
            <div className="flex flex-col items-center justify-center mb-2 pt-2 border-t border-dashed border-black">
                <div className="p-1 bg-white border border-black">
                    <QRCodeSVG value={JSON.stringify({ id: data.id })} size={100} level="M" />
                </div>
                <p className="text-[10px] font-bold uppercase mt-1 tracking-wider">Scan to Verify</p>
            </div>

            {/* Footer */}
            <div className="text-center text-[10px] font-bold uppercase mt-2">
                <p>Thank you for visiting!</p>
                <p className="text-[8px] mt-1 text-gray-600">{isCoupon ? 'Valid for One Ride • Non-Ref' : 'Non-Refundable • Non-Transferable'}</p>
            </div>
        </div >
    );

    return (
        <div ref={ref} className="hidden print:block">
            {/* Main Receipt (Only show if NOT skipping) */}
            {!skipMaster && <TicketContent data={{ id: ticketId }} />}

            {/* Combo Coupons */}
            {subTickets && subTickets.map((ticket, i) => (
                <TicketContent key={ticket.id} data={ticket} isCoupon={true} index={(i % 5) + 1} />
            ))}
        </div>
    );
});

Ticket.displayName = 'Ticket';
