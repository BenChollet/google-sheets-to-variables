import * as React from "react";

type LogoProps = {
    strokeColor: `#${string}`;
    strokeWidth?: number;
}

export default function Logo({ strokeColor, strokeWidth = 4 }: LogoProps) {
    return (
        <svg width="52" height="47" viewBox="0 0 52 47" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M18.7493 36.5833H5.91602M12.916 23.75H2.41602M18.7493 10.9167H7.08268M37.416 2.75L22.0243 24.2984C21.3431 25.2521 21.0025 25.729 21.0172 26.1266C21.03 26.4727 21.196 26.7953 21.4702 27.0069C21.7852 27.25 22.3712 27.25 23.5433 27.25H35.0827L32.7493 44.75L48.141 23.2016C48.8223 22.2479 49.1629 21.771 49.1482 21.3734C49.1353 21.0273 48.9693 20.7047 48.6951 20.4931C48.3802 20.25 47.7941 20.25 46.6221 20.25H35.0827L37.416 2.75Z"
                stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    )
}