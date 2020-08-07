###bash script to compile and deploy contracts and run environment
##author: MichaelBucher
##date: 25.06.2020

#remove abi folder from submodule idetix to make sure every .sol is compiled again
cd idetix
rm -rf abi

#compile and deploy the contracts
cd contracts
truffle compile
truffle migrate --reset

#move compiled contracts' .js files to client
cd ..
rm -rf ../src/abi
cp -r abi ../src/
