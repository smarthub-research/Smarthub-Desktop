
export default function CalculatedData({data}) {
    const dataHeaders = [
        "SU Average Stroke Length (sec)",
        "SS Average Stroke Length (sec)",
        "Distance per Stroke (m)",
        "SU Average Distance per Stroke (m)",
        "SS Average Distance per Stroke (m)",
        "Push Phase Length (sec)",
        "Distance per Push Phase (m)",
        "Recovery Phase Length (sec)",
        "Distance per Recovery Phase (m)",
        "SU Stroke Frequency (per min)",
        "SS Stroke Frequency (per min)",
        "Strokes per Bout (m)",
        "Total Number of Strokes",
        "Number of Bouts",
        "Bout (sec)",
        "Bout (m)",
        "SU Rate of rise (m/s^2)",
        "SS Rate of rise (m/s^2)",
        "Rolling Resistance (m/s^2)"
    ]

    const dataValues = [
        1.3622446013431900,
        1.7525363489359400,
        1.6870620250701900,
        1.3622446013431900,
        1.7525363489359400,
        1.194318084155810,
        0.4331351748872140,
        0.49274394091437800,
        0.2515620664588230,
        44.04495341059830,
        34.23609446755810,
        17.0,
        17.0,
        1.0,
        28.636948571485600,
        13.34272262961190,
        0.6815716890218700,
        0.38196118813349100,
        -0.19268498609262600
    ]

    return (
        <div className={'p-12 bg-[#0a0a0a] rounded-xl w-[80vw] '}>
            <ul>
                {dataHeaders.map((item, index) => (
                    <li key={index} className={'flex flex-row justify-between p-2'}>
                        <p>
                            {item}
                        </p>
                        <p>
                            {dataValues[index]}
                        </p>
                    </li>
                ))}
            </ul>

        </div>
    )
}